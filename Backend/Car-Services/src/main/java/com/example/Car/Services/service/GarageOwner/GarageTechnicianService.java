package com.example.Car.Services.service.GarageOwner;

import com.example.Car.Services.DTO.request.SalaryUpdateRequest;
import com.example.Car.Services.DTO.request.TechnicianRequestDTO;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.DTO.response.TechnicianResponseDTO;
import com.example.Car.Services.Interface.GarageOwner.GarageTechnicianServiceInterface;
import com.example.Car.Services.Repository.GarageRepository;
import com.example.Car.Services.Repository.GarageTechnicianRepository;
import com.example.Car.Services.Repository.UserRepository;
import com.example.Car.Services.Security.SecureToken;
import com.example.Car.Services.entities.Garage;
import com.example.Car.Services.entities.Technician;
import com.example.Car.Services.entities.User;
import com.example.Car.Services.enums.Role;
import com.example.Car.Services.expection.BadRequestException;
import com.example.Car.Services.expection.ResourceNotFoundException;
import com.example.Car.Services.service.common.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GarageTechnicianService
        implements GarageTechnicianServiceInterface {

    private final GarageTechnicianRepository garageTechnicianRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final GarageRepository garageRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    @Override
    public MessageResponse addTechnician(
            TechnicianRequestDTO request,
            Long garageId,
            Long ownerId
    ) {

        Garage garage =
                garageRepository
                        .findByIdAndOwnerId(
                                garageId,
                                ownerId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Garage not found or access denied!"
                                )
                        );

        if (userRepository.existsByEmail(
                request.getEmail()
        )) {

            throw new BadRequestException(
                    "Email is already registered!"
            );
        }

        if (userRepository.existsByPhone(
                request.getPhone()
        )) {

            throw new BadRequestException(
                    "Phone Number is already registered!"
            );
        }

        String verificationToken =
                UUID.randomUUID().toString();
        User technicianUser =
                new User();

        technicianUser.setFullName(
                request.getFullName()
        );

        technicianUser.setEmail(
                request.getEmail()
        );

        technicianUser.setPhone(
                request.getPhone()
        );

        technicianUser.setRole(
                Role.TECHNICIAN
        );

        technicianUser.setActive(false);

        technicianUser.setEmailVerified(false);

        String temporaryPassword =
                UUID.randomUUID().toString();

        technicianUser.setPassword(
                passwordEncoder.encode(
                        temporaryPassword
                )
        );

        technicianUser.setPasswordResetToken(
                verificationToken
        );

        technicianUser.setPasswordResetTokenExpiry(
                Instant.now().plusSeconds(86400)
        );

        technicianUser.setCreatedAt(
                Instant.now()
        );

        technicianUser.setUpdatedAt(
                Instant.now()
        );

        userRepository.save(
                technicianUser
        );

        Technician technician =
                new Technician();

        technician.setUser(
                technicianUser
        );

        technician.setGarage(
                garage
        );

        technician.setSpecialization(
                request.getSpecialization()
        );

        technician.setSalary(
                request.getSalary()
        );

        technician.setIsAvailable(
                true
        );

        garageTechnicianRepository.save(
                technician
        );

        emailService.sendTechnicianInvitationEmail(
                technicianUser.getEmail(),
                technicianUser.getFullName(),
                verificationToken
        );

        return new MessageResponse(
                "Technician added successfully and invitation email sent."
        );
    }

    @Transactional(readOnly = true)
    @Override
    public List<TechnicianResponseDTO> getTechniciansByGarage(
            Long garageId
    ) {

        Garage garage =
                garageRepository
                        .findById(
                                garageId
                        )
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Garage not found with ID: "
                                                + garageId
                                )
                        );

        return garageTechnicianRepository
                .findByGarageId(
                        garage.getId()
                )
                .stream()
                .map(this::toResponse)
                .collect(
                        Collectors.toList()
                );
    }

    @Transactional(readOnly = true)
    @Override
    public TechnicianResponseDTO findTechnician(
            Long technicianId,
            Long garageId,
            Long ownerId
    ) {

        checkGarageOwner(
                garageId,
                ownerId
        );

        Technician technician =
                findTechnicianInGarage(
                        technicianId,
                        garageId
                );

        return toResponse(
                technician
        );
    }

    @Transactional
    @Override
    public MessageResponse deactivateTechnician(
            Long technicianId,
            Long garageId,
            Long ownerId
    ) {

        checkGarageOwner(
                garageId,
                ownerId
        );

        Technician technician =
                findTechnicianInGarage(
                        technicianId,
                        garageId
                );

        if (Boolean.FALSE.equals(
                technician.getUser().getActive()
        )) {

            throw new BadRequestException(
                    "Technician account is already deactivated!"
            );
        }

        technician
                .getUser()
                .setActive(false);

        technician.setIsAvailable(
                false
        );

        technician.getUser().setUpdatedAt(
                Instant.now()
        );

        userRepository.save(
                technician.getUser()
        );

        garageTechnicianRepository.save(
                technician
        );

        emailService.sendTechnicianStatusEmail(
                technician.getUser().getEmail(),
                technician.getUser().getFullName(),
                false
        );

        return new MessageResponse(
                "Technician account deactivated successfully."
        );
    }

    @Transactional
    @Override
    public MessageResponse activateTechnician(
            Long technicianId,
            Long garageId,
            Long ownerId
    ) {

        checkGarageOwner(
                garageId,
                ownerId
        );

        Technician technician =
                findTechnicianInGarage(
                        technicianId,
                        garageId
                );

        if (Boolean.TRUE.equals(
                technician.getUser().getActive()
        )) {

            throw new BadRequestException(
                    "Technician account is already active!"
            );
        }

        technician
                .getUser()
                .setActive(true);

        technician.setIsAvailable(
                true
        );

        technician.getUser().setUpdatedAt(
                Instant.now()
        );

        userRepository.save(
                technician.getUser()
        );

        garageTechnicianRepository.save(
                technician
        );

        emailService.sendTechnicianStatusEmail(
                technician.getUser().getEmail(),
                technician.getUser().getFullName(),
                true
        );

        return new MessageResponse(
                "Technician account activated successfully."
        );
    }

    @Transactional
    @Override
    public MessageResponse updateSalary(
            Long technicianId,
            Long garageId,
            Long ownerId,
            SalaryUpdateRequest request
    ) {

        checkGarageOwner(
                garageId,
                ownerId
        );

        Technician technician =
                findTechnicianInGarage(
                        technicianId,
                        garageId
                );

        technician.setSalary(
                request.getSalary()
        );

        garageTechnicianRepository.save(
                technician
        );

        emailService.sendTechnicianSalaryUpdateEmail(
                technician.getUser().getEmail(),
                technician.getUser().getFullName(),
                request.getSalary()
        );

        return new MessageResponse(
                "Technician salary updated successfully."
        );
    }

    private void checkGarageOwner(
            Long garageId,
            Long ownerId
    ) {

        garageRepository
                .findByIdAndOwnerId(
                        garageId,
                        ownerId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Garage not found or access denied!"
                        )
                );
    }

    private Technician findTechnicianInGarage(
            Long technicianId,
            Long garageId
    ) {

        return garageTechnicianRepository
                .findByIdAndGarageId(
                        technicianId,
                        garageId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Technician not found in this garage!"
                        )
                );
    }

    private TechnicianResponseDTO toResponse(
            Technician technician
    ) {

        return new TechnicianResponseDTO(
                technician.getId(),
                technician.getUser().getFullName(),
                technician.getUser().getEmail(),
                technician.getUser().getPhone(),
                technician.getSpecialization(),
                technician.getSalary(),
                technician.getIsAvailable(),
                technician.getUser().getActive()
        );
    }
}