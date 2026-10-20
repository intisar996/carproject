package com.example.Car.Services.entities;

import com.example.Car.Services.enums.ServiceRequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_request")
@Getter
@Setter
public class ServiceCustomerRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "garage_option_id", nullable = false)
    private GarageServiceOption garageServiceOption;

    @Column(name = "guest_name", nullable = false)
    private String guestName;

    @Column(name = "guest_phone", nullable = false)
    private String guestPhone;

    @Column(name = "guest_email")
    private String guestEmail;

    @Column(name = "car_make_model", nullable = false)
    private String carMakeModel;

    @Column(name = "car_plate_number", nullable = false)
    private String carPlateNumber;

    @Column(name = "applied_price", nullable = false, precision = 10, scale = 3)
    private BigDecimal appliedPrice;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "tracking_token", unique = true, nullable = false)
    private String trackingToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ServiceRequestStatus status;


    @Column(length = 500)
    private String rejectionReason;


    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}