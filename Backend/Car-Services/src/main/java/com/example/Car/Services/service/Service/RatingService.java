
package com.example.Car.Services.service.Service;

import com.example.Car.Services.DTO.request.CreateRatingRequest;
import com.example.Car.Services.DTO.response.RatingResponse;
import com.example.Car.Services.Repository.RatingRepository;
import com.example.Car.Services.Repository.ServiceCustomerRequestRepository;
import com.example.Car.Services.entities.Rating;
import com.example.Car.Services.entities.ServiceCustomerRequest;
import com.example.Car.Services.enums.ServiceRequestStatus;
import com.example.Car.Services.expection.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final ServiceCustomerRequestRepository serviceCustomerRequestRepository;

    public RatingService(RatingRepository ratingRepository, ServiceCustomerRequestRepository serviceCustomerRequestRepository) {
        this.ratingRepository = ratingRepository;
        this.serviceCustomerRequestRepository = serviceCustomerRequestRepository;
    }

    @Transactional
    public void createRating(String trackingToken, CreateRatingRequest dto) {

        if (trackingToken == null || trackingToken.isBlank()) {
            throw new BadRequestException("Rating token is required");
        }

        ServiceCustomerRequest serviceRequest = serviceCustomerRequestRepository.findByTrackingToken(trackingToken)
                        .orElseThrow(() -> new BadRequestException("Service request not found"));

        if (serviceRequest.getStatus() != ServiceRequestStatus.COMPLETED) {
            throw new BadRequestException("You can rate the service only after it is completed");
        }

        if (ratingRepository.existsByServiceRequest_RequestId(serviceRequest.getRequestId())) {
            throw new BadRequestException("This service request has already been rated");
        }

        if (dto.getStars() == null
                || dto.getStars() < 1
                || dto.getStars() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars");
        }

        Rating rating = new Rating();
        rating.setServiceRequest(serviceRequest);
        rating.setStars(dto.getStars());
        rating.setComment(dto.getComment());

        ratingRepository.save(rating);
    }



    @Transactional(readOnly = true)
    public RatingResponse getRatingForOwner(Long requestId, Long ownerId) {

        ServiceCustomerRequest serviceRequest = serviceCustomerRequestRepository.findById(requestId)
                        .orElseThrow(() -> new BadRequestException("Service request not found"));

        if (!serviceRequest.getGarageServiceOption().getGarage().getOwnerId().equals(ownerId)) {
            throw new BadRequestException("You are not allowed to view this rating");
        }

        return ratingRepository
                .findByServiceRequest_RequestId(requestId)
                .map(rating -> {
                    RatingResponse response = new RatingResponse();
                    response.setStars(rating.getStars());
                    response.setComment(rating.getComment());
                    response.setCreatedAt(rating.getCreatedAt());
                    return response;
                })
                .orElse(null);
    }










}
