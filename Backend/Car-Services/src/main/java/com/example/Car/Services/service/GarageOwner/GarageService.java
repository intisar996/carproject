
package com.example.Car.Services.service.GarageOwner;

import com.example.Car.Services.DTO.request.NewGarageRequestDTO;
import com.example.Car.Services.DTO.response.GarageResponseDTO;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.DTO.response.PageResponse;
import com.example.Car.Services.DTO.response.RegistrationDocumentResponse;
import com.example.Car.Services.Interface.GarageOwner.GarageServiceInterface;
import com.example.Car.Services.Repository.GarageRepository;
import com.example.Car.Services.Repository.RegistrationDocumentRepository;
import com.example.Car.Services.Repository.UserRepository;
import com.example.Car.Services.Utils.PaginationUtils;
import com.example.Car.Services.entities.Garage;
import com.example.Car.Services.entities.RegistrationDocument;
import com.example.Car.Services.entities.User;
import com.example.Car.Services.enums.GarageStatus;
import com.example.Car.Services.enums.RequestStatus;
import com.example.Car.Services.expection.BadRequestException;
import com.example.Car.Services.expection.ResourceNotFoundException;
import com.example.Car.Services.service.common.EmailService;
import com.example.Car.Services.service.common.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GarageService implements GarageServiceInterface {

    private final GarageRepository garageRepository;
    private final UserRepository userRepository;
    private final RegistrationDocumentRepository documentRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;



    @Transactional(readOnly = true)
    @Override
    public List<GarageResponseDTO> getOwnerGarages(Long ownerId) {
        log.info("Fetching all garages for owner ID: {}", ownerId);
        List<Garage> garages = garageRepository.findByOwnerId(ownerId);
        log.info("Found {} garages for owner ID: {}", garages.size(), ownerId);
        return GarageResponseDTO.convertToList(garages);
    }

    @Transactional(readOnly = true)
    @Override
    public List<GarageResponseDTO> getOwnerActiveGarages(Long ownerId) {
        log.info("Fetching active garages for owner ID: {}", ownerId);
        List<Garage> garages = garageRepository.findByOwnerIdAndStatus(ownerId, GarageStatus.ACTIVE);
        log.info("Found {} active garages for owner ID: {}", garages.size(), ownerId);
        return GarageResponseDTO.convertToList(garages);
    }



    @Transactional
    @Override
    public MessageResponse deactivateGarage(Long garageId, Long ownerId) {
        log.info("Request received to deactivate garage ID: {} by owner ID: {}", garageId, ownerId);

        Garage garage = garageRepository.findById(garageId)
                .orElseThrow(() -> new BadRequestException("Garage not found with ID: " + garageId));

        if (!garage.getOwnerId().equals(ownerId)) {
            log.warn("Unauthorized deactivation attempt on garage ID: {} by owner ID: {}", garageId, ownerId);
            throw new AccessDeniedException("You do not have permission to modify this garage");
        }

        garage.setStatus(GarageStatus.INACTIVE);
        garageRepository.save(garage);

        log.info("Garage ID: {} has been successfully set to INACTIVE", garageId);

        return new MessageResponse("Garage deactivated successfully");
    }

    @Transactional
    @Override
    public MessageResponse requestNewGarage(Long ownerId, NewGarageRequestDTO request) {

        log.info("Starting new garage request process for existing owner ID: {}", ownerId);
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new BadRequestException("Owner not found with ID: " + ownerId));

        if (documentRepository.existsByCommercialRegisterNumber(request.getCommercialRegisterNumber())) {
            log.warn("New garage request rejected: Commercial Register Number {} already exists", request.getCommercialRegisterNumber());
            throw new ResourceNotFoundException("Commercial register number is already registered!");
        }
        String storedFileName = fileStorageService.storeFile(request.getCertificateFile());

        RegistrationDocument document = new RegistrationDocument();
        document.setOwner(owner);
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
        log.info("New garage request submitted successfully. Document ID: {} for Owner ID: {}",
                savedDocument.getDocId(), ownerId);
        try {
            emailService.sendGarageRequestConfirmationEmail(owner.getEmail(), owner.getFullName(),document.getGarageName());
        }catch (Exception ex) {
            log.error("Failed to send welcome email to {}: {}", owner.getEmail(), ex.getMessage());
        }
        return new MessageResponse("New garage request submitted successfully. Awaiting admin approval.");
    }


    @Transactional(readOnly = true)
    @Override
    public PageResponse<RegistrationDocumentResponse> getOwnerGaragesReqisterDocumention(
            Long ownerId, int page, int size) {
        log.info("Fetching garage registration documents for owner: {}", ownerId);
        Pageable pageable = PaginationUtils.createPageRequest(page, size);

        Page<RegistrationDocument> documents = documentRepository.findByOwnerId(ownerId, pageable);

        log.info("Successfully fetched {} registration documents for owner {}",
                documents.getNumberOfElements(), ownerId);

        return PaginationUtils.toPageResponse(
                documents,
                RegistrationDocumentResponse::fromEntity
        );
    }






    }

