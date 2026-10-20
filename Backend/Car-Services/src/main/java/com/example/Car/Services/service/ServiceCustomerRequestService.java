package com.example.Car.Services.service;

import com.example.Car.Services.DTO.request.ServiceCustomerRequestRequest;
import com.example.Car.Services.DTO.response.ServiceCustomerRequestResponse;
import com.example.Car.Services.Repository.GarageServiceOptionRepository;
import com.example.Car.Services.Repository.ServiceCustomerRequestRepository;
import com.example.Car.Services.entities.GarageServiceOption;
import com.example.Car.Services.entities.ServiceCustomerRequest;
import com.example.Car.Services.enums.ServiceRequestStatus;
import com.example.Car.Services.expection.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ServiceCustomerRequestService {

    private final ServiceCustomerRequestRepository serviceCustomerRequestRepository;
    private final GarageServiceOptionRepository garageServiceOptionRepository;

    public ServiceCustomerRequestService(
            ServiceCustomerRequestRepository serviceCustomerRequestRepository,
            GarageServiceOptionRepository garageServiceOptionRepository) {

        this.serviceCustomerRequestRepository = serviceCustomerRequestRepository;
        this.garageServiceOptionRepository = garageServiceOptionRepository;
    }

    @Transactional
    public ServiceCustomerRequestResponse create(
            ServiceCustomerRequestRequest request) {

        GarageServiceOption garageOption =
                garageServiceOptionRepository.findById(request.getGarageOptionId())
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Garage service option not found"));

        if (!Boolean.TRUE.equals(garageOption.getIsAvailable())) {
            throw new BadRequestException(
                    "This service is currently unavailable");
        }

        ServiceCustomerRequest serviceRequest =
                new ServiceCustomerRequest();

        serviceRequest.setGarageServiceOption(garageOption);
        serviceRequest.setGuestName(request.getGuestName());
        serviceRequest.setGuestPhone(request.getGuestPhone());
        serviceRequest.setGuestEmail(request.getGuestEmail());
        serviceRequest.setCarMakeModel(request.getCarMakeModel());
        serviceRequest.setCarPlateNumber(request.getCarPlateNumber());

        // Customer location
        serviceRequest.setLatitude(request.getLatitude());
        serviceRequest.setLongitude(request.getLongitude());

        serviceRequest.setAppliedPrice(garageOption.getPrice());

        serviceRequest.setStatus(ServiceRequestStatus.PENDING);
        serviceRequest.setTrackingToken(UUID.randomUUID().toString());

        serviceRequest.setCreatedAt(LocalDateTime.now());

        ServiceCustomerRequest saved =
                serviceCustomerRequestRepository.save(serviceRequest);

        return toResponse(saved);
    }

    public List<ServiceCustomerRequestResponse> getAll() {

        return serviceCustomerRequestRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ServiceCustomerRequestResponse> getOwnerRequests(Long ownerId) {
        return serviceCustomerRequestRepository.findByGarageServiceOption_Garage_OwnerIdOrderByCreatedAtDesc(
                        ownerId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ServiceCustomerRequestResponse getById(Long id) {

        ServiceCustomerRequest serviceRequest =
                serviceCustomerRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Service request not found"));

        return toResponse(serviceRequest);
    }



    @Transactional
    public ServiceCustomerRequestResponse acceptRequest(Long id, Long ownerId) {

        ServiceCustomerRequest serviceRequest = serviceCustomerRequestRepository.findById(id)
                         .orElseThrow(() -> new BadRequestException("Service request not found"));

                  if (!serviceRequest.getGarageServiceOption()
                    .getGarage().getOwnerId().equals(ownerId)) {
                     throw new BadRequestException("You are not allowed to accept this request");
                  }

           if (serviceRequest.getStatus() != ServiceRequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be accepted");}

              serviceRequest.setStatus(ServiceRequestStatus.ACCEPTED);

               ServiceCustomerRequest saved = serviceCustomerRequestRepository.save(serviceRequest);
               return toResponse(saved);
           }


    @Transactional
    public ServiceCustomerRequestResponse  rejectRequest(Long id, Long ownerId, String rejectionReason) {

        ServiceCustomerRequest serviceRequest = serviceCustomerRequestRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Service request not found"));

        if (!serviceRequest.getGarageServiceOption()
                .getGarage().getOwnerId().equals(ownerId)) {
            throw new BadRequestException("You are not allowed to reject  this request");
        }


        if(rejectionReason == null || rejectionReason.isBlank()){
            throw new BadRequestException("Rejection reason is required");
        }

        serviceRequest.setStatus(ServiceRequestStatus.REJECTED);
        serviceRequest.setRejectionReason(rejectionReason.trim());

        ServiceCustomerRequest saved = serviceCustomerRequestRepository.save(serviceRequest);
        return toResponse(saved);
    }





    public ServiceCustomerRequestResponse update(
            Long id,
            ServiceCustomerRequestRequest request) {

        ServiceCustomerRequest serviceRequest =
                serviceCustomerRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Service request not found"));

        GarageServiceOption garageOption =
                garageServiceOptionRepository.findById(
                                request.getGarageOptionId())
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Garage service option not found"));

        if (!Boolean.TRUE.equals(garageOption.getIsAvailable())) {
            throw new BadRequestException(
                    "This service is currently unavailable");
        }

        serviceRequest.setGarageServiceOption(garageOption);
        serviceRequest.setGuestName(request.getGuestName());
        serviceRequest.setGuestPhone(request.getGuestPhone());
        serviceRequest.setGuestEmail(request.getGuestEmail());
        serviceRequest.setCarMakeModel(request.getCarMakeModel());
        serviceRequest.setCarPlateNumber(request.getCarPlateNumber());

        serviceRequest.setLatitude(request.getLatitude());
        serviceRequest.setLongitude(request.getLongitude());

        serviceRequest.setAppliedPrice(garageOption.getPrice());

        ServiceCustomerRequest updated =
                serviceCustomerRequestRepository.save(serviceRequest);

        return toResponse(updated);
    }

    public void delete(Long id) {

        if (!serviceCustomerRequestRepository.existsById(id)) {
            throw new BadRequestException(
                    "Service request not found");
        }

        serviceCustomerRequestRepository.deleteById(id);
    }

    private ServiceCustomerRequestResponse toResponse(
            ServiceCustomerRequest serviceRequest) {

        return new ServiceCustomerRequestResponse(
                serviceRequest.getRequestId(),
                serviceRequest.getGarageServiceOption().getGarage().getId(),
                serviceRequest.getGarageServiceOption().getGarage().getName(),
                serviceRequest.getGuestName(),
                serviceRequest.getGuestPhone(),
                serviceRequest.getGuestEmail(),
                serviceRequest.getCarMakeModel(),
                serviceRequest.getCarPlateNumber(),
                serviceRequest.getAppliedPrice(),
                serviceRequest.getStatus(),
                serviceRequest.getRejectionReason(),
                serviceRequest.getCreatedAt(),
                serviceRequest.getLatitude(),
                serviceRequest.getLongitude()
        );
    }
}
