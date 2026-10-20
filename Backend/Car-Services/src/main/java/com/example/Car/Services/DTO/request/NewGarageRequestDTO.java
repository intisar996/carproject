package com.example.Car.Services.DTO.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Getter
@Setter
public class NewGarageRequestDTO {

    @NotBlank(message = "Garage name is required")
    private String garageName;

    @NotBlank(message = "Commercial register number is required")
    private String commercialRegisterNumber;

    @NotNull(message = "Register certificate file is required")
    private MultipartFile certificateFile;

    @NotBlank(message = "Governorate is required")
    private String governorate;

    @NotBlank(message = "State is required")
    private String state;

    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;
}
