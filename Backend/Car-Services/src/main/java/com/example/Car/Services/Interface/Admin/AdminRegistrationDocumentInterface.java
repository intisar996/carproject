package com.example.Car.Services.Interface.Admin;

import com.example.Car.Services.DTO.request.DecisionRequestDTO;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.DTO.response.PageResponse;
import com.example.Car.Services.DTO.response.RegistrationDocumentResponse;

import java.awt.print.Pageable;

public interface AdminRegistrationDocumentInterface {


    PageResponse<RegistrationDocumentResponse> getAllRegistrationDocuments(int page, int size);

    RegistrationDocumentResponse getRegistrationDocumentsById(Long Id);

    MessageResponse makeDecision(Long id, DecisionRequestDTO requestDTO);
}
