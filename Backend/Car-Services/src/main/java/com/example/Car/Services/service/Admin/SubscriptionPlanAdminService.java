package com.example.Car.Services.service.Admin;

import com.example.Car.Services.DTO.request.SubscriptionPlanRequestDTO;
import com.example.Car.Services.DTO.response.SubscriptionPlanResponse;
import com.example.Car.Services.Interface.Admin.AdminSubscriptionPlanInterface;
import com.example.Car.Services.Repository.SubscriptionPlanRepository;
import com.example.Car.Services.entities.SubscriptionPlan;
import com.example.Car.Services.expection.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionPlanAdminService implements AdminSubscriptionPlanInterface {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Transactional
    @Override
    public SubscriptionPlanResponse createPlan(SubscriptionPlanRequestDTO requestDTO) {

        log.info("Creating subscription plan: {}", requestDTO.getPlanName());

        if (subscriptionPlanRepository.existsByPlanName(requestDTO.getPlanName())) {
            throw new BadRequestException("Subscription plan already exists");
        }

        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setPlanName(requestDTO.getPlanName());
        plan.setPrice(requestDTO.getPrice());
        plan.setDurationDays(requestDTO.getDurationDays());
        plan.setActive(true);

        SubscriptionPlan savedPlan = subscriptionPlanRepository.save(plan);

        log.info("Subscription plan created successfully with ID: {}", savedPlan.getId());

        return SubscriptionPlanResponse.fromEntity(savedPlan);
    }

    @Transactional(readOnly = true)
    @Override
    public List<SubscriptionPlanResponse> getAllPlans() {

        log.info("Fetching all subscription plans");

        List<SubscriptionPlan> plans = subscriptionPlanRepository.findAll();

        log.info("Successfully fetched {} subscription plans", plans.size());

        return SubscriptionPlanResponse.fromEntity(plans);
    }

    @Transactional(readOnly = true)
    @Override
    public SubscriptionPlanResponse getPlanById(Long id) {

        SubscriptionPlan plan = subscriptionPlanRepository
                .findById(id)
                .orElseThrow(() -> {
                    log.warn("Subscription plan not found with ID: {}", id);
                    return new BadRequestException(
                            "Subscription plan not found with ID: " + id
                    );
                });

        log.info("Successfully retrieved subscription plan with ID: {}", id);

        return SubscriptionPlanResponse.fromEntity(plan);
    }

    @Transactional
    @Override
    public SubscriptionPlanResponse updatePlan(
            Long id,
            SubscriptionPlanRequestDTO requestDTO) {

        SubscriptionPlan plan = subscriptionPlanRepository
                .findById(id)
                .orElseThrow(() -> {
                    log.warn("Subscription plan not found with ID: {}", id);
                    return new BadRequestException(
                            "Subscription plan not found with ID: " + id
                    );
                });

        if (!plan.getPlanName().equals(requestDTO.getPlanName())
                && subscriptionPlanRepository.existsByPlanName(requestDTO.getPlanName())) {

            throw new BadRequestException("Subscription plan already exists");
        }

        plan.setPlanName(requestDTO.getPlanName());
        plan.setPrice(requestDTO.getPrice());
        plan.setDurationDays(requestDTO.getDurationDays());

        SubscriptionPlan updatedPlan = subscriptionPlanRepository.save(plan);

        log.info("Subscription plan updated successfully with ID: {}", id);

        return SubscriptionPlanResponse.fromEntity(updatedPlan);
    }

    @Transactional
    @Override
    public void changePlanStatus(Long id, Boolean active) {

        SubscriptionPlan plan = subscriptionPlanRepository
                .findById(id)
                .orElseThrow(() -> {
                    log.warn("Subscription plan not found with ID: {}", id);
                    return new BadRequestException(
                            "Subscription plan not found with ID: " + id
                    );
                });

        plan.setActive(active);
        subscriptionPlanRepository.save(plan);

        log.info("Subscription plan status changed successfully. ID: {}, active: {}", id, active);
    }
}
