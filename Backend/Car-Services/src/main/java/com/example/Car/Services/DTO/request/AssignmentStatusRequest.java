package com.example.Car.Services.DTO.request;

import com.example.Car.Services.enums.AssignmentStatus;

public record AssignmentStatusRequest(
        AssignmentStatus status
) {
}