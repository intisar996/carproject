package com.example.Car.Services.entities;

import com.example.Car.Services.enums.PhotoType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "repair_photo")
@Getter
@Setter
@NoArgsConstructor
public class RepairPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "photo_id")
    private Long photoId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private ServiceCustomerRequest serviceRequest;

    @Enumerated(EnumType.STRING)
    @Column(name = "photo_type", nullable = false, length = 10)
    private PhotoType photoType;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "captured_at", nullable = false, updatable = false)
    private Instant capturedAt;

    @PrePersist
    private void onCreate() {
        if (capturedAt == null) {
            capturedAt = Instant.now();
        }
    }
}