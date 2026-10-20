
        package com.example.Car.Services.Interface.GarageOwner;

import com.example.Car.Services.DTO.request.SalaryUpdateRequest;
import com.example.Car.Services.DTO.request.TechnicianRequestDTO;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.DTO.response.TechnicianResponseDTO;

import java.util.List;

public interface GarageTechnicianServiceInterface {

    MessageResponse addTechnician(
            TechnicianRequestDTO request,
            Long garageId,
            Long ownerId
    );

    List<TechnicianResponseDTO> getTechniciansByGarage(
            Long garageId
    );

    TechnicianResponseDTO findTechnician(
            Long technicianId,
            Long garageId,
            Long ownerId
    );

    MessageResponse deactivateTechnician(
            Long technicianId,
            Long garageId,
            Long ownerId
    );

    MessageResponse activateTechnician(
            Long technicianId,
            Long garageId,
            Long ownerId
    );

    MessageResponse updateSalary(
            Long technicianId,
            Long garageId,
            Long ownerId,
            SalaryUpdateRequest request
    );
}
