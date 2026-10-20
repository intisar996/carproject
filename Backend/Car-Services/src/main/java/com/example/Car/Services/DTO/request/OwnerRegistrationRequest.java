package com.example.Car.Services.DTO.request;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Data
public class OwnerRegistrationRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;


    @Column(name = "garage_name", nullable = false)
    private String garageName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Commercial register number is required")
    private String commercialRegisterNumber;

    @NotNull(message = "Certificate file is required")
    private MultipartFile certificateFile;

    @NotBlank(message = "Governorate is required")
    private String governorate;

    @NotBlank(message = "State is required")
    private String state;

    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;

    private String mapAddress;

}
