package com.example.Car.Services.DTO.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ServiceCustomerRequestRequest {


    private Long garageId;

    private String garageName;

    private Long garageOptionId;

    private String guestName;

    private String guestPhone;

    private String guestEmail;

    private String carMakeModel;

    private String carPlateNumber;

    private BigDecimal latitude;

    private BigDecimal longitude;
}