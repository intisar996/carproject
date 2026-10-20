package com.example.Car.Services.Repository;

import com.example.Car.Services.entities.RegistrationDocument;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegistrationDocumentRepository extends JpaRepository<RegistrationDocument,Long> {

    boolean existsByCommercialRegisterNumber(String commercialRegisterNumber);


    Optional<RegistrationDocument> findByOwnerId(Long ownerUserId);


    Page<RegistrationDocument> findByOwnerId(Long ownerUserId, Pageable pageable);





}
