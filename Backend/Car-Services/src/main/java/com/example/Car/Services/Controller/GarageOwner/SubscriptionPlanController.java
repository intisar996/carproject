package com.example.Car.Services.Controller.GarageOwner;

import com.example.Car.Services.DTO.response.SubscriptionPlanResponse;
import com.example.Car.Services.Interface.GarageOwner.SubscriptionPlanInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@org.springframework.security.access.prepost.PreAuthorize("hasRole('GARAGE_OWNER')")
@RestController
@RequestMapping("/api/garage-owner/subscription-plans")
@RequiredArgsConstructor
public class SubscriptionPlanController {

    private final SubscriptionPlanInterface subscriptionPlanService;



    @GetMapping
    public ResponseEntity<List<SubscriptionPlanResponse>> getActivePlans( Authentication authentication)
    {
        List<SubscriptionPlanResponse> plans = subscriptionPlanService.getActivePlans(authentication);
        return ResponseEntity.ok(plans); }


}
