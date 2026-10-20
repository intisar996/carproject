package com.example.Car.Services.DTO.response;

import java.math.BigDecimal;

public record ServiceOptionResponse(
        Long serviceOptionId,
        Long serviceId,
        String type,
        String size,
        String brand
//        BigDecimal price
) {
}