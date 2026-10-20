package com.example.Car.Services.DTO.response;

import com.example.Car.Services.entities.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class SubscriptionPlanResponse {

    private Long id;
    private String planName;
    private BigDecimal price;
    private Integer durationDays;
    private Boolean active;

    public static SubscriptionPlanResponse fromEntity(SubscriptionPlan plan) {

        return new SubscriptionPlanResponse(
                plan.getId(),
                plan.getPlanName(),
                plan.getPrice(),
                plan.getDurationDays(),
                plan.getActive()
        );
    }

    public static List<SubscriptionPlanResponse> fromEntity(
            List<SubscriptionPlan> plans) {

        return plans.stream()
                .map(SubscriptionPlanResponse::fromEntity)
                .toList();
    }
}
