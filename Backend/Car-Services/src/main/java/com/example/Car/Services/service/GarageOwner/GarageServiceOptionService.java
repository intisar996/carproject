package com.example.Car.Services.service.GarageOwner;

import com.example.Car.Services.DTO.request.GarageServiceOptionRequestDTO;
import com.example.Car.Services.DTO.response.GarageServiceOptionResponseDTO;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.Interface.GarageOwner.GarageServiceOptionServiceInterface;
import com.example.Car.Services.Repository.GarageRepository;
import com.example.Car.Services.Repository.GarageServiceOptionRepository;
import com.example.Car.Services.Repository.ServiceOptionRepository;
import com.example.Car.Services.entities.Garage;
import com.example.Car.Services.entities.GarageServiceOption;
import com.example.Car.Services.entities.ServiceOption;
import com.example.Car.Services.expection.BadRequestException;
import com.example.Car.Services.expection.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GarageServiceOptionService
        implements GarageServiceOptionServiceInterface {

    private final GarageServiceOptionRepository garageServiceOptionRepository;
    private final GarageRepository garageRepository;
    private final ServiceOptionRepository serviceOptionRepository;


    // =========================
    // ADD SERVICE OPTION
    // =========================

    @Transactional
    @Override
    public MessageResponse addServiceOption(
            Long garageId,
            Long ownerId,
            GarageServiceOptionRequestDTO request
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

        ServiceOption serviceOption =
                serviceOptionRepository
                        .findById(
                                request.getServiceOptionId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service option not found!"
                                )
                        );

        boolean alreadyExists =
                garageServiceOptionRepository
                        .existsByGarageIdAndServiceOptionServiceOptionId(
                                garageId,
                                request.getServiceOptionId()
                        );

        if (alreadyExists) {
            throw new BadRequestException(
                    "This service option is already added to this garage!"
            );
        }

        GarageServiceOption garageServiceOption =
                new GarageServiceOption();

        garageServiceOption.setGarage(
                garage
        );

        garageServiceOption.setServiceOption(
                serviceOption
        );

        garageServiceOption.setPrice(
                request.getPrice()
        );

        garageServiceOption.setIsAvailable(
                request.getIsAvailable()
        );

        garageServiceOptionRepository.save(
                garageServiceOption
        );

        return new MessageResponse(
                "Garage service option added successfully."
        );
    }


    // =========================
    // GET GARAGE SERVICE OPTIONS
    // =========================

    @Transactional(readOnly = true)
    @Override
    public List<GarageServiceOptionResponseDTO> getGarageServiceOptions(
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

        return garageServiceOptionRepository
                .findByGarageId(
                        garageId
                )
                .stream()
                .map(this::toResponse)
                .collect(
                        Collectors.toList()
                );
    }


    // =========================
    // UPDATE SERVICE OPTION
    // =========================

    @Transactional
    @Override
    public MessageResponse updateServiceOption(
            Long garageId,
            Long garageOptionId,
            Long ownerId,
            GarageServiceOptionRequestDTO request
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

        GarageServiceOption garageServiceOption =
                garageServiceOptionRepository
                        .findByGarageOptionIdAndGarageId(
                                garageOptionId,
                                garageId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Garage service option not found!"
                                )
                        );

        ServiceOption serviceOption =
                serviceOptionRepository
                        .findById(
                                request.getServiceOptionId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service option not found!"
                                )
                        );

        Long currentServiceOptionId =
                garageServiceOption
                        .getServiceOption()
                        .getServiceOptionId();

        if (!currentServiceOptionId.equals(
                request.getServiceOptionId()
        )) {

            boolean alreadyExists =
                    garageServiceOptionRepository
                            .existsByGarageIdAndServiceOptionServiceOptionId(
                                    garageId,
                                    request.getServiceOptionId()
                            );

            if (alreadyExists) {
                throw new BadRequestException(
                        "This service option is already added to this garage!"
                );
            }
        }

        garageServiceOption.setServiceOption(
                serviceOption
        );

        garageServiceOption.setPrice(
                request.getPrice()
        );

        garageServiceOption.setIsAvailable(
                request.getIsAvailable()
        );

        garageServiceOptionRepository.save(
                garageServiceOption
        );

        return new MessageResponse(
                "Garage service option updated successfully."
        );
    }


    // =========================
    // ENTITY -> RESPONSE DTO
    // =========================

    private GarageServiceOptionResponseDTO toResponse(
            GarageServiceOption garageServiceOption
    ) {

        ServiceOption option =
                garageServiceOption.getServiceOption();

        return new GarageServiceOptionResponseDTO(
                garageServiceOption.getGarageOptionId(),
                garageServiceOption.getGarage().getId(),
                option.getServiceOptionId(),
                option.getService().getName(),
                option.getType(),
                option.getSize(),
                option.getBrand(),
                garageServiceOption.getPrice(),
                garageServiceOption.getIsAvailable()
        );
    }
}