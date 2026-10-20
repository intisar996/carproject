package com.example.Car.Services.Interface.Admin;

import com.example.Car.Services.DTO.request.SubscriptionPlanRequestDTO;
import com.example.Car.Services.DTO.response.SubscriptionPlanResponse;

import java.util.List;

public interface AdminSubscriptionPlanInterface {

    SubscriptionPlanResponse createPlan(SubscriptionPlanRequestDTO requestDTO);

    List<SubscriptionPlanResponse> getAllPlans();

    SubscriptionPlanResponse getPlanById(Long id);

    SubscriptionPlanResponse updatePlan(Long id, SubscriptionPlanRequestDTO requestDTO);

    void changePlanStatus(Long id, Boolean active);
}
