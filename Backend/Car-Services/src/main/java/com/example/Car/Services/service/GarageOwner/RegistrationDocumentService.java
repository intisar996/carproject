package com.example.Car.Services.service.GarageOwner;


import com.example.Car.Services.DTO.request.DecisionRequestDTO;
import com.example.Car.Services.DTO.request.OwnerRegistrationRequest;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.DTO.response.RegistrationDocumentResponse;
import com.example.Car.Services.Interface.GarageOwner.RegistrationDocumentInterface;
import com.example.Car.Services.Repository.RegistrationDocumentRepository;
import com.example.Car.Services.Repository.UserRepository;
import com.example.Car.Services.entities.RegistrationDocument;
import com.example.Car.Services.entities.User;
import com.example.Car.Services.enums.RequestStatus;
import com.example.Car.Services.enums.Role;
import com.example.Car.Services.expection.BadRequestException;
import com.example.Car.Services.expection.ConflictException;
import com.example.Car.Services.service.common.EmailService;
import com.example.Car.Services.service.common.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationDocumentService  implements RegistrationDocumentInterface {

    private final UserRepository userRepository;
    private final RegistrationDocumentRepository documentRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;


    @Transactional
    @Override
    public MessageResponse registerGarageOwner(OwnerRegistrationRequest request) {

        log.info("Starting garage registration process for owner email: {}", request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already in use");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone number is already in use");
        }

        if (documentRepository.existsByCommercialRegisterNumber(request.getCommercialRegisterNumber())) {
            log.warn("Registration rejected: Commercial Register Number {} already exists", request.getCommercialRegisterNumber());
            throw new BadRequestException("Commercial register number is already registered!");
        }

        User owner = new User();
        owner.setFullName(request.getFullName());
        owner.setEmail(request.getEmail());
        owner.setPhone(request.getPhone());
        owner.setPassword(passwordEncoder.encode(request.getPassword()));
        owner.setRole(Role.GARAGE_OWNER);
        owner.setActive(false);
        owner.setCreatedAt(Instant.now());
        User savedOwner = userRepository.save(owner);


        String storedFileName = fileStorageService.storeFile(request.getCertificateFile());
        RegistrationDocument document = new RegistrationDocument();
        document.setOwner(savedOwner);
        document.setGarageName(request.getGarageName());
        document.setCommercialRegisterNumber(request.getCommercialRegisterNumber());
        document.setRegisterCertificateFile(storedFileName);
        document.setGovernorate(request.getGovernorate());
        document.setState(request.getState());
        document.setLatitude(request.getLatitude());
        document.setLongitude(request.getLongitude());
        document.setStatus(RequestStatus.PENDING_APPROVAL);
        document.setCreatedAt(Instant.now());
        RegistrationDocument savedDocument = documentRepository.save(document);

        emailService.sendWelcomeEmail(request.getEmail(), request.getFullName());


        log.info("Garage registration completed successfully. Document ID: {}", savedDocument.getDocId());
        return new MessageResponse("Registration request submitted successfully. Awaiting admin approval.");

    }


}
