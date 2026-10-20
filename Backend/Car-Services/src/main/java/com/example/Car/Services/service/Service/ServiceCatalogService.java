package com.example.Car.Services.service.Service;

import com.example.Car.Services.DTO.request.ServiceOptionRequest;
import com.example.Car.Services.DTO.response.CustomerGarageResponse;
import com.example.Car.Services.DTO.response.ServiceOptionResponse;
import com.example.Car.Services.DTO.request.ServiceRequest;
import com.example.Car.Services.DTO.response.ServiceResponse;
import com.example.Car.Services.Repository.GarageServiceOptionRepository;
import com.example.Car.Services.Repository.ServiceOptionRepository;
import com.example.Car.Services.Repository.ServiceRepository;
import com.example.Car.Services.entities.GarageServiceOption;
import com.example.Car.Services.entities.Service;
import com.example.Car.Services.entities.ServiceOption;
import com.example.Car.Services.enums.SubscriptionStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@org.springframework.stereotype.Service
public class ServiceCatalogService {

    private final ServiceRepository serviceRepository;
    private final ServiceOptionRepository optionRepository;
    private final GarageServiceOptionRepository garageServiceOptionRepository;

    public ServiceCatalogService(
            ServiceRepository serviceRepository,
            ServiceOptionRepository optionRepository,
            GarageServiceOptionRepository garageServiceOptionRepository
    ) {
        this.serviceRepository = serviceRepository;
        this.optionRepository = optionRepository;
        this.garageServiceOptionRepository = garageServiceOptionRepository;
    }
    public ServiceResponse createService(ServiceRequest request) {
        String name = requiredText(request.name(), "Service name");

        Service service = new Service();
        service.setName(name);

        return toServiceResponse(serviceRepository.save(service));
    }

    public List<ServiceResponse> getAllServices() {
        return serviceRepository.findAll()
                .stream()
                .map(this::toServiceResponse)
                .toList();
    }

    public ServiceResponse getService(Long serviceId) {
        return toServiceResponse(findService(serviceId));
    }

    public ServiceResponse updateService(
            Long serviceId,
            ServiceRequest request
    ) {
        Service service = findService(serviceId);
        service.setName(requiredText(request.name(), "Service name"));

        return toServiceResponse(serviceRepository.save(service));
    }

    public void deleteService(Long serviceId) {
        Service service = findService(serviceId);

        if (optionRepository.existsByService_ServiceId(serviceId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Delete this service's options first"
            );
        }

        serviceRepository.delete(service);
    }

    public ServiceOptionResponse createOption(
            Long serviceId,
            ServiceOptionRequest request
    ) {
        Service service = findService(serviceId);
        validateOption(request);

        ServiceOption option = new ServiceOption();
        option.setService(service);
        option.setType(request.type().trim());
        option.setSize(optionalText(request.size()));
        option.setBrand(optionalText(request.brand()));
//        option.setPrice(request.price());

        return toOptionResponse(optionRepository.save(option));
    }

    public List<ServiceOptionResponse> getOptions(Long serviceId) {
        findService(serviceId);

        return optionRepository.findByService_ServiceId(serviceId)
                .stream()
                .map(this::toOptionResponse)
                .toList();
    }

    public ServiceOptionResponse getOption(
            Long serviceId,
            Long optionId
    ) {
        return toOptionResponse(findOption(serviceId, optionId));
    }

    public ServiceOptionResponse updateOption(
            Long serviceId,
            Long optionId,
            ServiceOptionRequest request
    ) {
        ServiceOption option = findOption(serviceId, optionId);
        validateOption(request);

        option.setType(request.type().trim());
        option.setSize(optionalText(request.size()));
        option.setBrand(optionalText(request.brand()));
//        option.setPrice(request.price());

        return toOptionResponse(optionRepository.save(option));
    }

    public void deleteOption(Long serviceId, Long optionId) {
        ServiceOption option = findOption(serviceId, optionId);
        optionRepository.delete(option);
    }

    private Service findService(Long serviceId) {
        return serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Service not found"
                ));
    }

    private ServiceOption findOption(Long serviceId, Long optionId) {
        ServiceOption option = optionRepository.findById(optionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Service option not found"
                ));

        if (!option.getService().getServiceId().equals(serviceId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Service option not found for this service"
            );
        }

        return option;
    }

    private void validateOption(ServiceOptionRequest request) {
        requiredText(request.type(), "Option type");
//
//        if (request.price() == null
//                || request.price().compareTo(BigDecimal.ZERO) < 0
//                || request.price().scale() > 3) {
//            throw new ResponseStatusException(
//                    HttpStatus.BAD_REQUEST,
//                    "Price must be zero or greater with at most 3 decimals"
//            );

    }

    private String requiredText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    fieldName + " is required"
            );
        }

        return value.trim();
    }

    private String optionalText(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ServiceResponse toServiceResponse(Service service) {
        return new ServiceResponse(
                service.getServiceId(),
                service.getName()
        );
    }

    private ServiceOptionResponse toOptionResponse(
            ServiceOption option
    ) {
        return new ServiceOptionResponse(
                option.getServiceOptionId(),
                option.getService().getServiceId(),
                option.getType(),
                option.getSize(),
                option.getBrand()
//                option.getPrice()
        );
    }



    public List<CustomerGarageResponse> getGaragesByService(Long serviceId) {

        List<GarageServiceOption> options =
                garageServiceOptionRepository.findAvailableGaragesByService(
                        serviceId,
                        SubscriptionStatus.ACTIVE,
                        Instant.now());
        return CustomerGarageResponse.convertToList(options);
    }

}