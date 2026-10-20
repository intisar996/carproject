package com.example.Car.Services.DTO.response;

import com.example.Car.Services.entities.TechnicianAssignment;
import com.example.Car.Services.enums.AssignmentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianTaskResponseDTO {

    private Long assignmentId;

    private Long requestId;

    private String guestName;

    private String guestPhone;

    private String carMakeModel;

    private String carPlateNumber;

    private AssignmentStatus status;

    private BigDecimal currentLatitude;

    private BigDecimal currentLongitude;



    public static TechnicianTaskResponseDTO convertToDTO(TechnicianAssignment entity) {

        return TechnicianTaskResponseDTO.builder()
                .assignmentId(entity.getAssignmentId())
                .requestId(entity.getServiceRequest().getRequestId())
                .guestName(entity.getServiceRequest().getGuestName())
                .guestPhone(entity.getServiceRequest().getGuestPhone())
                .carMakeModel(entity.getServiceRequest().getCarMakeModel())
                .carPlateNumber(entity.getServiceRequest().getCarPlateNumber())
                .status(entity.getStatus())
                .currentLatitude(entity.getServiceRequest().getLatitude())
                .currentLongitude(entity.getServiceRequest().getLongitude())
                .build();
    }


    public static List<TechnicianTaskResponseDTO> convertToDTO(
            List<TechnicianAssignment> entityList) {

        List<TechnicianTaskResponseDTO> dtos = new ArrayList<>();

        for (TechnicianAssignment entity : entityList) {
            dtos.add(convertToDTO(entity));
        }

        return dtos;
    }











}