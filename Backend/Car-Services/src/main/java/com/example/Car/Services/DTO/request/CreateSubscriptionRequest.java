package com.example.Car.Services.DTO.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateSubscriptionRequest {

    @jakarta.validation.constraints.NotNull
    private Long planId;
    @jakarta.validation.constraints.NotNull
    private Long garageId;
}
