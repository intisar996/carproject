package com.example.Car.Services.dto.garageOwner;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GarageRequestDTO {

    @NotBlank(message = "Garage name is required")
    private String name;

    @NotBlank(message = "Governorate is required")
    private String governorate;

    @NotBlank(message = "State is required")
    private String state;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @NotBlank(message = "Phone number is required")
    private String phone;
}