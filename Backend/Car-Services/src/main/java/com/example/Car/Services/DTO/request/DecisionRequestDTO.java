package com.example.Car.Services.DTO.request;

import com.example.Car.Services.enums.RequestStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class DecisionRequestDTO {
    @NotBlank(message = "Status is required")
    private RequestStatus status;
    private String reason;


}
