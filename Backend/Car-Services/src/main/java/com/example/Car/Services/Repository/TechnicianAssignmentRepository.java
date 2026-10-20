package com.example.Car.Services.Repository;

import com.example.Car.Services.entities.TechnicianAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TechnicianAssignmentRepository extends JpaRepository<TechnicianAssignment, Long> {

    Optional<TechnicianAssignment>
    findFirstByServiceRequest_RequestIdAndTechnician_User_IdOrderByAssignedAtDesc(
            Long requestId,
            Long technicianUserId
    );


    Optional<TechnicianAssignment> findFirstByServiceRequest_RequestIdOrderByAssignedAtDesc( Long requestId );

    List<TechnicianAssignment> findByTechnician_Id(Long technicianId);

    List<TechnicianAssignment> findByTechnician_User_Id(Long userId);

    List<TechnicianAssignment> findByServiceRequest_GarageServiceOption_Garage_OwnerIdOrderByAssignedAtDesc(Long ownerId);


}