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
public class GarageServiceOptionResponseDTO {

    private Long garageOptionId;
    private Long garageId;
    private Long serviceOptionId;
    private String serviceName;
    private String optionType;
    private String optionSize;
    private String optionBrand;
    private BigDecimal price;
    private Boolean isAvailable;
}