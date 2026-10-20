package com.example.Car.Services.service.Technician;

import com.example.Car.Services.DTO.TechnicianAssignmentDTO;
import com.example.Car.Services.DTO.request.AssignTechnicianRequestDTO;
import com.example.Car.Services.DTO.response.MessageResponse;
import com.example.Car.Services.DTO.response.OwnerTechnicianAssignmentResponse;
import com.example.Car.Services.DTO.response.TechnicianTaskResponseDTO;
import com.example.Car.Services.DTO.response.TrackingResponseDTO;
import com.example.Car.Services.Interface.Technician.TechnicianAssignmentServiceInterface;
import com.example.Car.Services.Repository.GarageTechnicianRepository;
import com.example.Car.Services.Repository.ServiceCustomerRequestRepository;
import com.example.Car.Services.Repository.TechnicianAssignmentRepository;
import com.example.Car.Services.Repository.UserRepository;
import com.example.Car.Services.constant.GeoConstants;
import com.example.Car.Services.entities.Garage;
import com.example.Car.Services.entities.ServiceCustomerRequest;
import com.example.Car.Services.entities.Technician;
import com.example.Car.Services.entities.TechnicianAssignment;
import com.example.Car.Services.entities.User;
import com.example.Car.Services.enums.AssignmentStatus;
import com.example.Car.Services.enums.ServiceRequestStatus;
import com.example.Car.Services.expection.BadRequestException;
import com.example.Car.Services.service.common.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class TechnicianAssignmentService
        implements TechnicianAssignmentServiceInterface {

    private final SimpMessagingTemplate messagingTemplate;
    private final TechnicianAssignmentRepository technicianAssignmentRepository;
    private final ServiceCustomerRequestRepository serviceCustomerRequestRepository;
    private final GarageTechnicianRepository garageTechnicianRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public TechnicianAssignmentService(
            SimpMessagingTemplate messagingTemplate,
            TechnicianAssignmentRepository technicianAssignmentRepository,
            ServiceCustomerRequestRepository serviceCustomerRequestRepository,
            GarageTechnicianRepository garageTechnicianRepository,
            UserRepository userRepository,
            EmailService emailService) {

        this.messagingTemplate = messagingTemplate;
        this.technicianAssignmentRepository = technicianAssignmentRepository;
        this.serviceCustomerRequestRepository = serviceCustomerRequestRepository;
        this.garageTechnicianRepository = garageTechnicianRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public MessageResponse assignTechnician(AssignTechnicianRequestDTO dto, Long assignedByUserId) {

        if (dto.getRequestId() == null) {
            throw new BadRequestException("Service request ID is required");
        }

        if (dto.getTechnicianId() == null) {
            throw new BadRequestException("Technician ID is required");
        }

        ServiceCustomerRequest serviceRequest = serviceCustomerRequestRepository.findById(dto.getRequestId())
        .orElseThrow(() -> new BadRequestException("Service request not found"));

        if (serviceRequest.getStatus() != ServiceRequestStatus.ACCEPTED) {
            throw new BadRequestException("Service request must be accepted before assigning a technician");
        }

        Garage garage = serviceRequest.getGarageServiceOption().getGarage();

        if (!garage.getOwnerId().equals(assignedByUserId)) {
            throw new BadRequestException("You are not allowed to assign a technician to this request");
        }

        Technician technician = garageTechnicianRepository.findByIdAndGarageId(dto.getTechnicianId(), garage.getId())
         .orElseThrow(() -> new BadRequestException("Technician not found in this garage"));

        if (!Boolean.TRUE.equals(technician.getIsAvailable())) {
            throw new BadRequestException("Technician is not available");
        }

        User assignedBy = userRepository.findById(assignedByUserId)
         .orElseThrow(() -> new BadRequestException("Garage owner not found"));

        TechnicianAssignment assignment = new TechnicianAssignment();

        assignment.setServiceRequest(serviceRequest);

        assignment.setTechnician(technician);
        assignment.setAssignedBy(assignedBy);
        assignment.setStatus(AssignmentStatus.ASSIGNED);

        assignment.setAssignedAt(Instant.now());

        technicianAssignmentRepository.save(assignment);
        serviceRequest.setStatus(ServiceRequestStatus.ACCEPTED);
        serviceCustomerRequestRepository.save(serviceRequest);

        String trackingLink = frontendUrl + "/track/" + serviceRequest.getTrackingToken();

        emailService.sendTrackingEmail(serviceRequest.getGuestEmail(), serviceRequest.getGuestName(), trackingLink);

        return new MessageResponse("Technician assigned successfully");
    }

    @Override
    @Transactional
    public MessageResponse updateLocation(Long assignmentId, TechnicianAssignmentDTO dto, Long technicianUserId) {

        if (assignmentId == null) {
            throw new BadRequestException("Assignment ID is required");
        }

        if (dto.getLatitude() == null || dto.getLongitude() == null) {

            throw new BadRequestException("Latitude and Longitude are required");
        }

        TechnicianAssignment technicianAssignment = technicianAssignmentRepository
         .findById(assignmentId).orElseThrow(() -> new BadRequestException("Technician assignment not found"));

        if (!technicianAssignment.getTechnician().getUser().getId().equals(technicianUserId)) {
            throw new BadRequestException("You are not allowed to update this assignment"
            );
        }

        if (technicianAssignment.getStatus() == AssignmentStatus.CANCELLED || technicianAssignment.getStatus() == AssignmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot update location for completed or cancelled assignment");
        }

        if (dto.getLatitude().compareTo(GeoConstants.MIN_LATITUDE) < 0 ||
                dto.getLatitude().compareTo(GeoConstants.MAX_LATITUDE) > 0 ||
                dto.getLongitude().compareTo(GeoConstants.MIN_LONGITUDE) < 0 ||
                dto.getLongitude().compareTo(GeoConstants.MAX_LONGITUDE) > 0) {
            throw new BadRequestException("Invalid latitude or longitude values");
        }

        technicianAssignment.setCurrentLatitude(dto.getLatitude());
        technicianAssignment.setCurrentLongitude(dto.getLongitude());

        technicianAssignment.setLastLocationUpdate(Instant.now());

        technicianAssignmentRepository.save(technicianAssignment);
        TrackingResponseDTO trackingResponse = new TrackingResponseDTO(assignmentId, technicianAssignment.getStatus(), technicianAssignment.getCurrentLatitude(), technicianAssignment.getCurrentLongitude());

        messagingTemplate.convertAndSend("/topic/location/" + assignmentId, trackingResponse);

        return new MessageResponse("Location updated successfully");
    }


    @Override
    @Transactional
    public MessageResponse updateStatus(Long assignmentId, AssignmentStatus newStatus, Long technicianUserId) {

        if (assignmentId == null) {
            throw new BadRequestException("Assignment ID is required");
        }

        if (newStatus == null) {
            throw new BadRequestException("Status is required");
        }

        TechnicianAssignment assignment = technicianAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new BadRequestException("Technician assignment not found"));

        if (!assignment.getTechnician().getUser().getId().equals(technicianUserId)) {
            throw new BadRequestException("You are not allowed to update this assignment");
        }

        if (assignment.getStatus() == AssignmentStatus.CANCELLED || assignment.getStatus() == AssignmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot update completed or cancelled assignment");
        }

        assignment.setStatus(newStatus);

        Instant now = Instant.now();

        if (newStatus == AssignmentStatus.ON_THE_WAY &&
                assignment.getStartedAt() == null) {

            assignment.setStartedAt(now);
        }

        if (newStatus == AssignmentStatus.ARRIVED &&
                assignment.getArrivedAt() == null) {

            assignment.setArrivedAt(now);
        }

        if (newStatus == AssignmentStatus.COMPLETED &&
                assignment.getCompletedAt() == null) {

            assignment.setCompletedAt(now);
        }

        technicianAssignmentRepository.save(
                assignment
        );

        TrackingResponseDTO trackingResponse =
                new TrackingResponseDTO(
                        assignmentId,
                        assignment.getStatus(),
                        assignment.getCurrentLatitude(),
                        assignment.getCurrentLongitude()
                );

        messagingTemplate.convertAndSend(
                "/topic/location/" + assignmentId,
                trackingResponse
        );

        return new MessageResponse(
                "Assignment status updated successfully"
        );
    }








    @Override
    @Transactional(readOnly = true)
    public List<TechnicianTaskResponseDTO> getMyAssignments(Long technicianId) {
       List<TechnicianAssignment> assignments =  technicianAssignmentRepository.findByTechnician_User_Id(technicianId);
        return  TechnicianTaskResponseDTO.convertToDTO(assignments);

    }


    @Override
    @Transactional(readOnly = true)
    public List<OwnerTechnicianAssignmentResponse> getOwnerAssignments(Long ownerId) {

        List<TechnicianAssignment> assignments = technicianAssignmentRepository
         .findByServiceRequest_GarageServiceOption_Garage_OwnerIdOrderByAssignedAtDesc(ownerId);

        return OwnerTechnicianAssignmentResponse.convertToList(assignments);
    }

}
