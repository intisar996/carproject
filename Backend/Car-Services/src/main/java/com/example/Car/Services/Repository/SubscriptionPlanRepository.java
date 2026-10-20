package com.example.Car.Services.Repository;

import com.example.Car.Services.entities.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    boolean existsByPlanName(String planName);

    List<SubscriptionPlan> findByActiveTrue();

    List<SubscriptionPlan> findByActiveTrueAndPlanNameNotIgnoreCase(String planName);





}
