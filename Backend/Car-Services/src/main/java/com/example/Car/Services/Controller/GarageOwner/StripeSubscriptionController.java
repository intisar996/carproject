package com.example.Car.Services.Controller.GarageOwner;

import com.example.Car.Services.DTO.request.CreateSubscriptionRequest;
import com.example.Car.Services.service.GarageOwner.GarageOwnerSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
@PreAuthorize("hasRole('GARAGE_OWNER')")
@RequiredArgsConstructor
public class StripeSubscriptionController {

    private final GarageOwnerSubscriptionService subscriptionService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @PostMapping("/checkout")
    public ResponseEntity<String> createCheckout(
            @jakarta.validation.Valid @RequestBody CreateSubscriptionRequest request
    ) throws Exception {

        String checkoutUrl =
                subscriptionService.createSubscription(request);

        if (checkoutUrl == null) {
            return ResponseEntity.ok(frontendUrl + "/payment-success");
        }

        return ResponseEntity.ok(checkoutUrl);
    }
}
