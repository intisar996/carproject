package com.example.Car.Services.Controller.Admin;

import com.example.Car.Services.DTO.request.SubscriptionPlanRequestDTO;
import com.example.Car.Services.DTO.response.SubscriptionPlanResponse;
import com.example.Car.Services.Interface.Admin.AdminSubscriptionPlanInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/subscription-plans")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSubscriptionPlanController {

    private final AdminSubscriptionPlanInterface subscriptionPlanService;




    @PostMapping
    public ResponseEntity<SubscriptionPlanResponse> createPlan(
            @Valid @RequestBody SubscriptionPlanRequestDTO requestDTO) {
        SubscriptionPlanResponse response = subscriptionPlanService.createPlan(requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionPlanResponse>> getAllPlans() {

        List<SubscriptionPlanResponse> plans =
                subscriptionPlanService.getAllPlans();

        return ResponseEntity.ok(plans);
    }

    @GetMapping("/id")
    public ResponseEntity<SubscriptionPlanResponse> getPlanById(
            @RequestParam Long id) {

        SubscriptionPlanResponse response =
                subscriptionPlanService.getPlanById(id);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionPlanResponse> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody SubscriptionPlanRequestDTO requestDTO) {

        SubscriptionPlanResponse response =
                subscriptionPlanService.updatePlan(id, requestDTO);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changePlanStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {

        subscriptionPlanService.changePlanStatus(id, active);

        return ResponseEntity.ok().build();
    }
}
