
package com.example.Car.Services.DTO.response;

import com.example.Car.Services.entities.TechnicianAssignment;
import com.example.Car.Services.entities.ServiceCustomerRequest;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerTechnicianAssignmentResponse {

    private Long assignmentId;
    private Long requestId;
    private String technicianName;
    private String customerName;
    private String customerPhone;
    private String carMakeModel;
    private String carPlateNumber;
    private BigDecimal appliedPrice;
    private com.example.Car.Services.enums.AssignmentStatus status;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Instant assignedAt;
    private Instant startedAt;
    private Instant arrivedAt;
    private Instant completedAt;
    private Instant lastLocationUpdate;

    public static OwnerTechnicianAssignmentResponse convertTo(
            TechnicianAssignment assignment) {

        if (assignment == null) {
            return null;
        }

        ServiceCustomerRequest request = assignment.getServiceRequest();

        return OwnerTechnicianAssignmentResponse.builder()
                .assignmentId(assignment.getAssignmentId())
                .requestId(request.getRequestId())
                .technicianName(
                        assignment.getTechnician().getUser().getFullName()
                )
                .customerName(request.getGuestName())
                .customerPhone(request.getGuestPhone())
                .carMakeModel(request.getCarMakeModel())
                .carPlateNumber(request.getCarPlateNumber())
                .appliedPrice(request.getAppliedPrice())
                .status(assignment.getStatus())
                .latitude(assignment.getCurrentLatitude())
                .longitude(assignment.getCurrentLongitude())
                .assignedAt(assignment.getAssignedAt())
                .startedAt(assignment.getStartedAt())
                .arrivedAt(assignment.getArrivedAt())
                .completedAt(assignment.getCompletedAt())
                .lastLocationUpdate(assignment.getLastLocationUpdate())
                .build();
    }

    public static List<OwnerTechnicianAssignmentResponse> convertToList(
            List<TechnicianAssignment> assignments) {

        if (assignments == null || assignments.isEmpty()) {
            return Collections.emptyList();
        }

        return assignments.stream()
                .map(OwnerTechnicianAssignmentResponse::convertTo)
                .collect(Collectors.toList());
    }
}
