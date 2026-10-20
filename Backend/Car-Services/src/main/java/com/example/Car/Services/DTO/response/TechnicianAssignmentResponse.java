package com.example.Car.Services.DTO.response;

import com.example.Car.Services.enums.AssignmentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record TechnicianAssignmentResponse(
        Long assignmentId,
        Long requestId,
        Long technicianId,
        Long assignedBy,
        AssignmentStatus status,
        BigDecimal currentLatitude,
        BigDecimal currentLongitude,
        Instant assignedAt,
        Instant startedAt,
        Instant arrivedAt,
        Instant completedAt,
        Instant lastLocationUpdate
) {
}