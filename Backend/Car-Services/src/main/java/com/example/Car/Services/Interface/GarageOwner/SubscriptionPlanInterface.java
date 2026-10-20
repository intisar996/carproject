package com.example.Car.Services.Interface.GarageOwner;

import com.example.Car.Services.DTO.response.SubscriptionPlanResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface SubscriptionPlanInterface {

    List<SubscriptionPlanResponse> getActivePlans( Authentication authentication);
}
