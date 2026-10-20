package com.example.Car.Services.service.GarageOwner;

import com.example.Car.Services.DTO.request.CreateSubscriptionRequest;
import com.example.Car.Services.Repository.GarageRepository;
import com.example.Car.Services.Repository.OwnerSubscriptionRepository;
import com.example.Car.Services.Repository.SubscriptionPlanRepository;
import com.example.Car.Services.entities.Garage;
import com.example.Car.Services.entities.OWNER_SUBSCRIPTION;
import com.example.Car.Services.entities.SubscriptionPlan;
import com.example.Car.Services.entities.User;
import com.example.Car.Services.enums.SubscriptionStatus;
import com.example.Car.Services.expection.BadRequestException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GarageOwnerSubscriptionService {

    private final com.example.Car.Services.Repository.SubscriptionOwnerRepository subscriptionOwnerRepository;
    private final GarageRepository garageRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final OwnerSubscriptionRepository ownerSubscriptionRepository;
    private final StripeSubscriptionService stripeSubscriptionService;





    @Transactional
    public String createSubscription(CreateSubscriptionRequest request) throws Exception {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User authenticatedUser = (User) authentication.getPrincipal();

        User owner = subscriptionOwnerRepository.lockOwner(authenticatedUser.getId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        Garage garage = garageRepository.findById(request.getGarageId())
                .orElseThrow(() -> new RuntimeException("Garage not found"));

        if (!garage.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("This garage does not belong to you");
        }

        Optional<OWNER_SUBSCRIPTION> activeSubscription =
                ownerSubscriptionRepository.findByGarageIdAndStatus(
                        garage.getId(),
                        SubscriptionStatus.ACTIVE
                );

        if (activeSubscription.isPresent()
                && activeSubscription.get().getEndDate().isAfter(Instant.now())) {

            throw new BadRequestException(
                    "This garage already has an active subscription"
            );
        }


        SubscriptionPlan plan = subscriptionPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Subscription plan not found"));

        if (!plan.getActive()) {
            throw new RuntimeException("Subscription plan is not active");
        }

        Instant startDate = Instant.now();

        boolean freeTrial = plan.getPrice().signum() == 0;
        if (freeTrial && Boolean.TRUE.equals(owner.getHasUsedFreeTrial())) {
            throw new com.example.Car.Services.expection.BadRequestException("Free trial has already been used");
        }
        Instant endDate = freeTrial
                ? startDate.atZone(java.time.ZoneOffset.UTC).plusMonths(3).toInstant()
                : startDate.plusSeconds(plan.getDurationDays() * 24L * 60L * 60L);
        if (freeTrial) {
            owner.setHasUsedFreeTrial(true);
            subscriptionOwnerRepository.save(owner);
        }

        OWNER_SUBSCRIPTION subscription = new OWNER_SUBSCRIPTION();

        subscription.setOwner(owner);
        subscription.setGarage(garage);
        subscription.setPlan(plan);
        subscription.setPaymentReference(UUID.randomUUID().toString());
        subscription.setAmount(plan.getPrice());
        subscription.setStartDate(startDate);
        subscription.setEndDate(endDate);
        subscription.setCreatedAt(startDate);

        if (subscription.getAmount().signum() == 0) {
            subscription.setPaymentStatus("FREE");
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            ownerSubscriptionRepository.save(subscription);
            return null;
        }

        return stripeSubscriptionService.createCheckoutSession(subscription);
    }




    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void expireSubscriptions() {
        List<OWNER_SUBSCRIPTION> subscriptions = ownerSubscriptionRepository
           .findByStatusAndEndDateBefore(SubscriptionStatus.ACTIVE, Instant.now());
        for (OWNER_SUBSCRIPTION subscription : subscriptions) {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
            ownerSubscriptionRepository.save(subscription);
        }
    }


}
