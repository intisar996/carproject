package com.example.Car.Services.DTO.response;


import com.example.Car.Services.entities.RegistrationDocument;
import jakarta.persistence.Column;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class RegistrationDocumentResponse {

    private Long id;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
    private String garageName;
    private String commercialRegisterNumber;
    private String registerCertificateFile;
    private String governorate;
    private String state;
    private String googleMapsUrl;
    private String status;



    public static RegistrationDocumentResponse fromEntity(RegistrationDocument doc) {
        RegistrationDocumentResponse response = new RegistrationDocumentResponse();
        response.setId(doc.getDocId());
        response.setGarageName(doc.getGarageName());
        response.setOwnerName(doc.getOwner().getFullName());
        response.setOwnerEmail(doc.getOwner().getEmail());
        response.setOwnerPhone(doc.getOwner().getPhone());
        response.setCommercialRegisterNumber(doc.getCommercialRegisterNumber());
        response.setRegisterCertificateFile(doc.getRegisterCertificateFile());
        response.setGovernorate(doc.getGovernorate());
        response.setState(doc.getState());
        response.setGoogleMapsUrl(doc.getGoogleMapsUrl());
        response.setStatus(doc.getStatus().name());

        return response;
    }


    public static List<RegistrationDocumentResponse> fromEntity(
            List<RegistrationDocument> entityList) {
         if(entityList == null){
             return new ArrayList<>();
         }
        List<RegistrationDocumentResponse> dtos = new ArrayList<>();
        for (RegistrationDocument entity : entityList) {
            if(entity != null){
                dtos.add(fromEntity(entity));
            }
        }
        return dtos;
    }






}
