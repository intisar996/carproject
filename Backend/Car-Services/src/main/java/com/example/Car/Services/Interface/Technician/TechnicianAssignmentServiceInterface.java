package com.example.Car.Services.Interface.Technician;

import com.example.Car.Services.DTO.TechnicianAssignmentDTO;
import com.example.Car.Services.DTO.request.AssignTechnicianRequestDTO;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.DTO.response.OwnerTechnicianAssignmentResponse;
import com.example.Car.Services.DTO.response.TechnicianTaskResponseDTO;
import com.example.Car.Services.entities.TechnicianAssignment;
import com.example.Car.Services.enums.AssignmentStatus;

import java.util.List;

public interface TechnicianAssignmentServiceInterface {

    MessageResponse assignTechnician(
            AssignTechnicianRequestDTO dto,
            Long assignedByUserId
    );

    MessageResponse updateLocation(Long assignmentId, TechnicianAssignmentDTO dto, Long technicianUserId);

    MessageResponse updateStatus(Long assignmentId, AssignmentStatus newStatus, Long technicianUserId);

    List<TechnicianTaskResponseDTO> getMyAssignments(Long technicianId);

    List<OwnerTechnicianAssignmentResponse> getOwnerAssignments(Long ownerId);


}