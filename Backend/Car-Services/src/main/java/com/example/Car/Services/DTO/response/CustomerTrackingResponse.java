
package com.example.Car.Services.DTO.response;

import com.example.Car.Services.entities.ServiceCustomerRequest;
import com.example.Car.Services.entities.TechnicianAssignment;
import com.example.Car.Services.enums.AssignmentStatus;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
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

    private BigDecimal customerLatitude;
    private BigDecimal customerLongitude;

    public static CustomerTrackingResponse convertToDTO(
            ServiceCustomerRequest request,
            TechnicianAssignment assignment,
            String garageName,
            String technicianName) {

        return CustomerTrackingResponse.builder()
                .requestId(request.getRequestId())
                .assignmentId(assignment.getAssignmentId())
                .garageName(garageName)
                .technicianName(technicianName)
                .status(assignment.getStatus())
                .latitude(assignment.getCurrentLatitude())
                .longitude(assignment.getCurrentLongitude())
                .customerLatitude(request.getLatitude())
                .customerLongitude(request.getLongitude())
                .build();
    }
}
