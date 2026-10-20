package com.example.Car.Services.services.GarageOwner;

import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.Repository.GarageRepository;
import com.example.Car.Services.Repository.RegistrationDocumentRepository;
import com.example.Car.Services.Repository.UserRepository;
import com.example.Car.Services.entities.Garage;
import com.example.Car.Services.enums.GarageStatus;
import com.example.Car.Services.service.GarageOwner.GarageService;
import com.example.Car.Services.service.common.EmailService;
import com.example.Car.Services.service.common.FileStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GarageServiceTest {

    @Mock
    private GarageRepository garageRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RegistrationDocumentRepository documentRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private FileStorageService fileStorageService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private GarageService garageService;

    @Test
    void deactivateGarage_success() {
        // Arrange
        Long garageId = 1L;
        Long ownerId = 10L;

        Garage garage = new Garage();
        garage.setOwnerId(ownerId);
        garage.setStatus(GarageStatus.ACTIVE);

        when(garageRepository.findById(garageId))
                .thenReturn(Optional.of(garage));

        // Act
        MessageResponse response =
                garageService.deactivateGarage(garageId, ownerId);

        // Assert
        assertEquals(GarageStatus.INACTIVE, garage.getStatus());
        verify(garageRepository).save(garage);
        assertEquals("Garage deactivated successfully",
                response.getMessage());
    }
}