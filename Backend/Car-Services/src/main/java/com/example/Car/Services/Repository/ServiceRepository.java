package com.example.Car.Services.Repository;

import com.example.Car.Services.entities.Service;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<Service, Long> {
}