        package com.example.Car.Services.Interface.Commn;

import java.math.BigDecimal;

public interface EmailServiceInterface {

    void sendVerificationEmail(
            String toEmail,
            String token
    );

    void sendPasswordRestEmail(
            String toEmail,
            String token
    );

    void sendWelcomeEmail(
            String toEmail,
            String fullName
    );

    void sendApprovalEmail(
            String toEmail,
            String fullName,
            String token
    );

    void sendRejectionEmail(
            String toEmail,
            String fullName,
            String reason
    );

    void sendGarageRequestConfirmationEmail(
            String toEmail,
            String fullName,
            String garageName
    );

    void sendTechnicianInvitationEmail(
            String toEmail,
            String fullName,
            String rawToken
    );

    void sendTechnicianSalaryUpdateEmail(
            String toEmail,
            String fullName,
            BigDecimal newSalary
    );

    void sendTechnicianStatusEmail(
            String toEmail,
            String fullName,
            boolean active
    );


    void sendTrackingEmail(String toEmail, String fullName, String trackingLink);


}