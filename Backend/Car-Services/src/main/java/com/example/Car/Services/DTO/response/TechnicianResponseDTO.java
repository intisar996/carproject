package com.example.Car.Services.DTO.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianResponseDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String specialization;
    private BigDecimal salary;
    private Boolean isAvailable;
    private Boolean isActive;
}