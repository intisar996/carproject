package com.example.Car.Services.Interface.GarageOwner;

import com.example.Car.Services.DTO.request.DecisionRequestDTO;
import com.example.Car.Services.DTO.request.OwnerRegistrationRequest;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.DTO.response.RegistrationDocumentResponse;
import jakarta.validation.Valid;

import java.util.List;

public interface RegistrationDocumentInterface {


    MessageResponse registerGarageOwner(@Valid OwnerRegistrationRequest request);

}
