package com.example.Car.Services.DTO.response;

import com.example.Car.Services.enums.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerTrackingResponse {

    private Long requestId;
    private Long assignmentId;

    private String garageName;

    private String technicianName;

    private AssignmentStatus status;

    private BigDecimal latitude;
    private BigDecimal longitude;

    

}

