package com.example.Car.Services.Controller.GarageOwner;


import com.example.Car.Services.DTO.request.OwnerRegistrationRequest;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.Interface.GarageOwner.RegistrationDocumentInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/registration")
@RequiredArgsConstructor
public class RegistrationDocumentController {



    private final RegistrationDocumentInterface documentService;

    @PostMapping(value = "/register-owner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageResponse> registerGarageOwner(@Valid @ModelAttribute OwnerRegistrationRequest request) {
        return ResponseEntity.ok(documentService.registerGarageOwner(request));
    }
}
