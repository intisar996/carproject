package com.example.Car.Services.service.GarageOwner;

import com.example.Car.Services.DTO.response.SubscriptionPlanResponse;
import com.example.Car.Services.Interface.GarageOwner.SubscriptionPlanInterface;
import com.example.Car.Services.Repository.SubscriptionPlanRepository;
import com.example.Car.Services.Repository.UserRepository;
import com.example.Car.Services.entities.SubscriptionPlan;
import com.example.Car.Services.entities.User;
import com.example.Car.Services.expection.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionPlanService implements SubscriptionPlanInterface {

    private final UserRepository userRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Transactional(readOnly = true)
    @Override
    public List<SubscriptionPlanResponse> getActivePlans(
            Authentication authentication) {

        if (authentication == null
                || !(authentication.getPrincipal() instanceof User currentUser)) {
            throw new BadRequestException("User not authenticated");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() ->
                        new BadRequestException("User not found"));

        log.info("Fetching active subscription plans for user ID: {}",
                user.getId());

        List<SubscriptionPlan> plans;

        if (Boolean.TRUE.equals(user.getHasUsedFreeTrial())) {
            plans = subscriptionPlanRepository
                    .findByActiveTrueAndPlanNameNotIgnoreCase("free");
        } else {
            plans = subscriptionPlanRepository.findByActiveTrue();
        }

        if (Boolean.TRUE.equals(user.getHasUsedFreeTrial())) {
            plans = plans.stream().filter(plan -> plan.getPrice().signum() > 0).toList();
        }
        return SubscriptionPlanResponse.fromEntity(plans);
    }
}
