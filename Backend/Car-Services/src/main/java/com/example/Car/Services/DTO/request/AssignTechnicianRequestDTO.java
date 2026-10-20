package com.example.Car.Services.DTO.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignTechnicianRequestDTO {

    private Long requestId;

    private Long technicianId;
}