package com.example.Car.Services.Controller.Admin;


import com.example.Car.Services.DTO.request.DecisionRequestDTO;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.DTO.response.PageResponse;
import com.example.Car.Services.DTO.response.RegistrationDocumentResponse;
import com.example.Car.Services.Interface.Admin.AdminRegistrationDocumentInterface;
import com.example.Car.Services.Interface.GarageOwner.RegistrationDocumentInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.awt.print.Pageable;
import java.util.List;

@RestController
@RequestMapping("/api/admin/registration-documents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRegistrationDocumentController {


   private final AdminRegistrationDocumentInterface registrationDocumentService;


    @GetMapping
    public ResponseEntity<PageResponse<RegistrationDocumentResponse>> getAllDocument(int page, int size){
        PageResponse<RegistrationDocumentResponse> documents = registrationDocumentService.getAllRegistrationDocuments(page,size);
        return ResponseEntity.ok(documents);
    }


    @GetMapping("getById")
    public ResponseEntity<RegistrationDocumentResponse> getDocumentById(@RequestParam Long Id){
        RegistrationDocumentResponse documents = registrationDocumentService.getRegistrationDocumentsById(Id);
        return ResponseEntity.ok(documents);
    }


    @PostMapping("/make-decision/{docId}")
    public ResponseEntity<MessageResponse> makeDecision(@Valid @PathVariable Long docId, @RequestBody DecisionRequestDTO request) {
        MessageResponse response = registrationDocumentService.makeDecision(docId,request);
        return ResponseEntity.ok(response);
    }











}
