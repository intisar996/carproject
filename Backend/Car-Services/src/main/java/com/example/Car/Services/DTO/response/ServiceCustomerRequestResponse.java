package com.example.Car.Services.DTO.response;

import com.example.Car.Services.enums.ServiceRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceCustomerRequestResponse {

    private Long requestId;

    private Long garageId;

    private String garageName;

    private String guestName;

    private String guestPhone;

    private String guestEmail;

    private String carMakeModel;

    private String carPlateNumber;

    private BigDecimal appliedPrice;

    private ServiceRequestStatus status;

    private String rejectionReason;

    private LocalDateTime createdAt;

    private BigDecimal latitude;

    private BigDecimal longitude;

}
