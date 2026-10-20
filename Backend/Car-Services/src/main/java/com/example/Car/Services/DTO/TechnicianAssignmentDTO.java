package com.example.Car.Services.DTO;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;


@Setter
@Getter
public class TechnicianAssignmentDTO {

        private Long assignmentId;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String Status;

    }


