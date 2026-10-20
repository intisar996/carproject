package com.example.Car.Services.Repository;

import com.example.Car.Services.entities.OWNER_SUBSCRIPTION;
import com.example.Car.Services.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OwnerSubscriptionRepository extends JpaRepository<OWNER_SUBSCRIPTION, Long> {

    Optional<OWNER_SUBSCRIPTION> findByPaymentReference(String paymentReference);

    Optional<OWNER_SUBSCRIPTION> findByStripeSessionId(String stripeSessionId);

    Optional<OWNER_SUBSCRIPTION> findByStripePaymentIntentId(String stripePaymentIntentId);

    List<OWNER_SUBSCRIPTION> findByStatusAndEndDateBefore(SubscriptionStatus status, Instant date);

    Optional<OWNER_SUBSCRIPTION> findByGarageIdAndStatus(Long garageId, SubscriptionStatus status);
}
