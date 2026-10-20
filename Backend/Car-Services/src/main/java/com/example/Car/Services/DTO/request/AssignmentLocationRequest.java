package com.example.Car.Services.DTO.request;

import java.math.BigDecimal;

public record AssignmentLocationRequest(
        BigDecimal currentLatitude,
        BigDecimal currentLongitude
) {
}