package com.example.Car.Services.entities;


import com.example.Car.Services.enums.RequestStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "registration_documents")
@Data
public class RegistrationDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doc_id")
    private Long docId;

    @Column(name = "garage_name", nullable = false)
    private String garageName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @NotNull(message = "Owner is required")
    private User owner;

    @NotBlank(message = "Commercial register number is required")
    @Size(max = 50, message = "Commercial register number cannot exceed 50 characters")
    @Column(name = "commercial_register_number", nullable = false)
    private String commercialRegisterNumber;

    @NotBlank(message = "Registration certificate file is required")
    @Column(name = "register_certificate_file", nullable = false)
    private String registerCertificateFile;

    @Column(name = "governorate", nullable = false)
    private String governorate;

    @Column(name = "state", nullable = false)
    private String state;

    @Column(name = "latitude")
    private BigDecimal latitude;

    @Column(name = "longitude")
    private BigDecimal longitude;

    @Column(name = "map_address")
    private String mapAddress;

    @NotNull(message = "Document status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false,length = 50)
    private RequestStatus status = RequestStatus.PENDING_APPROVAL;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_admin_id")
    private User reviewedByAdmin;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public String getGoogleMapsUrl() {
        if (this.latitude != null && this.longitude != null) {
            return "https://www.google.com/maps?q=" + this.latitude + "," + this.longitude;
        }
        return null;
    }



}
