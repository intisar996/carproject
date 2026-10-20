package com.example.Car.Services.service.Technician;

import com.example.Car.Services.DTO.response.CustomerTrackingResponse;
import com.example.Car.Services.Repository.ServiceCustomerRequestRepository;
import com.example.Car.Services.Repository.TechnicianAssignmentRepository;
import com.example.Car.Services.entities.ServiceCustomerRequest;
import com.example.Car.Services.entities.TechnicianAssignment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TrackingService {

    private final ServiceCustomerRequestRepository serviceCustomerRequestRepository;
    private final TechnicianAssignmentRepository technicianAssignmentRepository;

    @Transactional(readOnly = true)
    public CustomerTrackingResponse getTracking(String trackingToken) {

        ServiceCustomerRequest request = serviceCustomerRequestRepository.findByTrackingToken(trackingToken)
          .orElseThrow(() -> new RuntimeException("Tracking request not found"));

        TechnicianAssignment assignment = technicianAssignmentRepository
                .findFirstByServiceRequest_RequestIdOrderByAssignedAtDesc(
                 request.getRequestId()).orElseThrow(() -> new RuntimeException("Technician assignment not found"));

        String garageName = request.getGarageServiceOption().getGarage().getName();

        String technicianName = assignment.getTechnician().getUser().getFullName();

        return new CustomerTrackingResponse(
                request.getRequestId(),
                assignment.getAssignmentId(),
                garageName,
                technicianName,
                assignment.getStatus(),
                assignment.getCurrentLatitude(),
                assignment.getCurrentLongitude()
        );
    }
}