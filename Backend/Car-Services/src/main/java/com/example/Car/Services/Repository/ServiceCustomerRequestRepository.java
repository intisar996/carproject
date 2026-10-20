package com.example.Car.Services.Repository;

import com.example.Car.Services.entities.ServiceCustomerRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceCustomerRequestRepository
        extends JpaRepository<ServiceCustomerRequest, Long> {

    List<ServiceCustomerRequest>
    findByGarageServiceOption_Garage_OwnerIdOrderByCreatedAtDesc(
            Long ownerId
    );

    Optional<ServiceCustomerRequest> findByTrackingToken(String trackingToken);



}
