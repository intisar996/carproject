package com.example.Car.Services.Interface.GarageOwner;

import com.example.Car.Services.DTO.request.GarageServiceOptionRequestDTO;
import com.example.Car.Services.DTO.response.GarageServiceOptionResponseDTO;
import com.example.Car.Services.DTO.response.MessageResponse;

import java.util.List;

public interface GarageServiceOptionServiceInterface {

    MessageResponse addServiceOption(
            Long garageId,
            Long ownerId,
            GarageServiceOptionRequestDTO request
    );

    List<GarageServiceOptionResponseDTO> getGarageServiceOptions(
            Long garageId,
            Long ownerId
    );

    MessageResponse updateServiceOption(
            Long garageId,
            Long garageOptionId,
            Long ownerId,
            GarageServiceOptionRequestDTO request
    );
}