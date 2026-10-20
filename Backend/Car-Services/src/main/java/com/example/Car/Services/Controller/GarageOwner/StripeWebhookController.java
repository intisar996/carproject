package com.example.Car.Services.Controller.GarageOwner;

import com.example.Car.Services.Repository.OwnerSubscriptionRepository;
import com.example.Car.Services.enums.SubscriptionStatus;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final OwnerSubscriptionRepository ownerSubscriptionRepository;

    @Value("${stripe.webhook-secret:${STRIPE_WEBHOOK_SECRET:}}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature
    ) {

        try {
            Event event = Webhook.constructEvent(
                    payload,
                    signature,
                    webhookSecret
            );

            if ("checkout.session.completed".equals(event.getType())) {

                Session session = (Session) event
                        .getDataObjectDeserializer()
                        .getObject()
                        .orElseThrow();

                ownerSubscriptionRepository
                        .findByStripeSessionId(session.getId())
                        .ifPresent(subscription -> {
                            if (!"paid".equals(session.getPaymentStatus())) {
                                return;
                            }

                            subscription.setPaymentStatus("PAID");
                            subscription.setStatus(SubscriptionStatus.ACTIVE);
                            subscription.setPaidAt(Instant.now());

                            if (session.getPaymentIntent() != null) {
                                subscription.setStripePaymentIntentId(
                                        session.getPaymentIntent()
                                );
                            }

                            ownerSubscriptionRepository.save(subscription);
                        });
            }

            return ResponseEntity.ok("Webhook received");

        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }
    }
}
