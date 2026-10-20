package com.example.Car.Services.DTO.request;

import com.example.Car.Services.enums.AssignmentStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAssignmentStatusRequestDTO {

    private AssignmentStatus status;
}

