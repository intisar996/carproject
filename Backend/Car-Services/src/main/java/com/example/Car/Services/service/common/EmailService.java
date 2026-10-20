package com.example.Car.Services.service.common;

import com.example.Car.Services.Interface.Commn.EmailServiceInterface;
import com.example.Car.Services.expection.EmailSendingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class EmailService implements EmailServiceInterface {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Override
    @Async
    public void sendVerificationEmail(
            String toEmail,
            String token
    ) {

        try {
            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true,
                            "UTF-8"
                    );

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(
                    "Car Service - Verify Your Email"
            );

            String verificationLink =
                    frontendUrl
                            + "/verify-email?token="
                            + token;

            String emailBody =
                    "Welcome to Car Services!\n\n"
                            + "Thank you for registering with us.\n\n"
                            + "Please verify your email address by clicking the link below:\n"
                            + verificationLink
                            + "\n\n"
                            + "Best regards,\n"
                            + "Car Services Team";

            helper.setText(
                    emailBody.replace(
                            verificationLink,
                            "<a href=\""
                                    + verificationLink
                                    + "\">"
                                    + verificationLink
                                    + "</a>"
                    ),
                    true
            );

            mailSender.send(message);

            log.info(
                    "Verification email sent to {}",
                    toEmail
            );

        } catch (Exception ex) {

            log.error(
                    "Failed to send verification email to {}",
                    toEmail,
                    ex
            );

            throw new EmailSendingException(
                    "Failed to send verification Email"
            );
        }
    }

    @Override
    @Async
    public void sendPasswordRestEmail(
            String toEmail,
            String token
    ) {

        try {
            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true,
                            "UTF-8"
                    );

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(
                    "Car Service app - Password Reset"
            );

            String resetLink =
                    frontendUrl
                            + "/reset-password?token="
                            + token;

            String emailBody =
                    "Hello,\n\n"
                            + "We received a request to reset your password.\n\n"
                            + "Please click the link below:\n"
                            + resetLink
                            + "\n\n"
                            + "If you did not request this, please ignore this email.\n\n"
                            + "Best regards,\n"
                            + "Car Services Team";

            helper.setText(
                    emailBody.replace(
                            resetLink,
                            "<a href=\""
                                    + resetLink
                                    + "\">"
                                    + resetLink
                                    + "</a>"
                    ),
                    true
            );

            mailSender.send(message);

            log.info(
                    "Password reset email sent to {}",
                    toEmail
            );

        } catch (Exception ex) {

            log.error(
                    "Failed to send password reset email to {}",
                    toEmail,
                    ex
            );

            throw new EmailSendingException(
                    "Failed to send password reset email"
            );
        }
    }

    @Override
    @Async
    public void sendWelcomeEmail(
            String toEmail,
            String fullName
    ) {

        try {
            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(
                    "Car Services - Application Received"
            );

            String emailBody =
                    "Dear " + fullName + ",\n\n"
                            + "Welcome to Car Services!\n\n"
                            + "We have successfully received your garage registration request.\n\n"
                            + "Our admin team is reviewing your application.\n\n"
                            + "Best regards,\n"
                            + "Car Services Team";

            message.setText(emailBody);

            mailSender.send(message);

            log.info(
                    "Welcome email sent to {}",
                    toEmail
            );

        } catch (Exception ex) {

            log.error(
                    "Failed to send welcome email to {}",
                    toEmail,
                    ex
            );

            throw new EmailSendingException(
                    "Failed to send welcome email"
            );
        }
    }

    @Override
    @Async
    public void sendApprovalEmail(
            String toEmail,
            String fullName,
            String token
    ) {

        try {
            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true,
                            "UTF-8"
                    );

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(
                    "Car Services - Application Approved"
            );

            String verificationLink =
                    frontendUrl
                            + "/verify-email?token="
                            + token;

            String emailBody =
                    "Dear " + fullName + ",\n\n"
                            + "Your garage registration request has been approved.\n\n"
                            + "Please activate your account using the link below:\n"
                            + verificationLink
                            + "\n\n"
                            + "Best regards,\n"
                            + "Car Services Team";

            helper.setText(
                    emailBody.replace(
                            verificationLink,
                            "<a href=\""
                                    + verificationLink
                                    + "\">"
                                    + verificationLink
                                    + "</a>"
                    ),
                    true
            );

            mailSender.send(message);

            log.info(
                    "Approval email sent to {}",
                    toEmail
            );

        } catch (Exception ex) {

            log.error(
                    "Failed to send approval email to {}",
                    toEmail,
                    ex
            );

            throw new EmailSendingException(
                    "Failed to send approval email"
            );
        }
    }

    @Override
    @Async
    public void sendRejectionEmail(
            String toEmail,
            String fullName,
            String reason
    ) {

        try {
            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(
                    "Car Services - Application Status Update"
            );

            String emailBody =
                    "Dear " + fullName + ",\n\n"
                            + "Your garage registration request could not be approved.\n\n"
                            + "Reason:\n"
                            + (reason != null
                            ? reason
                            : "No reason provided.")
                            + "\n\n"
                            + "Best regards,\n"
                            + "Car Services Team";

            message.setText(emailBody);

            mailSender.send(message);

            log.info(
                    "Rejection email sent to {}",
                    toEmail
            );

        } catch (Exception ex) {

            log.error(
                    "Failed to send rejection email to {}",
                    toEmail,
                    ex
            );

            throw new EmailSendingException(
                    "Failed to send rejection email"
            );
        }
    }

    @Override
    @Async
    public void sendGarageRequestConfirmationEmail(
            String toEmail,
            String fullName,
            String garageName
    ) {

        try {
            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(
                    "Car Services - New Garage Request Received"
            );

            String emailBody =
                    "Dear " + fullName + ",\n\n"
                            + "We received your request to add the garage: "
                            + garageName
                            + ".\n\n"
                            + "Our admin team will review the request.\n\n"
                            + "Best regards,\n"
                            + "Car Services Team";

            message.setText(emailBody);

            mailSender.send(message);

            log.info(
                    "Garage request email sent to {}",
                    toEmail
            );

        } catch (Exception ex) {

            log.error(
                    "Failed to send garage request email to {}",
                    toEmail,
                    ex
            );
        }
    }

    @Override
    @Async
    public void sendTechnicianInvitationEmail(
            String toEmail,
            String fullName,
            String rawToken
    ) {

        try {
            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true,
                            "UTF-8"
                    );

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(
                    "Car Services - Technician Invitation"
            );

            String setPasswordLink =
                    frontendUrl
                            + "/set-password?token="
                            + rawToken;

            String emailBody =
                    "Dear " + fullName + ",\n\n"
                            + "You have been added as a Technician.\n\n"
                            + "Please set your password using the link below:\n"
                            + setPasswordLink
                            + "\n\n"
                            + "Best regards,\n"
                            + "Car Services Team";

            helper.setText(
                    emailBody.replace(
                            setPasswordLink,
                            "<a href=\""
                                    + setPasswordLink
                                    + "\">"
                                    + setPasswordLink
                                    + "</a>"
                    ),
                    true
            );

            mailSender.send(message);

            log.info(
                    "Technician invitation sent to {}",
                    toEmail
            );

        } catch (Exception ex) {

            log.error(
                    "Failed to send technician invitation to {}",
                    toEmail,
                    ex
            );

            throw new EmailSendingException(
                    "Failed to send technician invitation email"
            );
        }
    }

    @Override
    @Async
    public void sendTechnicianSalaryUpdateEmail(
            String toEmail,
            String fullName,
            BigDecimal newSalary
    ) {

        try {
            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setFrom(fromEmail);
            message.setTo(toEmail);

            message.setSubject(
                    "Car Services - Salary Update"
            );

            String emailBody =
                    "Dear " + fullName + ",\n\n"
                            + "Your salary information has been updated.\n\n"
                            + "New Salary: "
                            + newSalary
                            + "\n\n"
                            + "If you have any questions, please contact your garage owner.\n\n"
                            + "Best regards,\n"
                            + "Car Services Team";

            message.setText(emailBody);

            mailSender.send(message);

            log.info(
                    "Salary update email sent to {}",
                    toEmail
            );

        } catch (Exception ex) {

            log.error(
                    "Failed to send salary update email to {}",
                    toEmail,
                    ex
            );

            throw new EmailSendingException(
                    "Failed to send salary update email"
            );
        }
    }

    @Override
    @Async
    public void sendTechnicianStatusEmail(
            String toEmail,
            String fullName,
            boolean active
    ) {

        try {
            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setFrom(fromEmail);
            message.setTo(toEmail);

            String status =
                    active
                            ? "Activated"
                            : "Deactivated";

            message.setSubject(
                    "Car Services - Account " + status
            );

            String emailBody =
                    "Dear " + fullName + ",\n\n"
                            + "Your technician account has been "
                            + status.toLowerCase()
                            + ".\n\n";

            if (active) {
                emailBody +=
                        "You can now access your technician account.\n\n";
            } else {
                emailBody +=
                        "You will not be able to access your technician account until it is activated again.\n\n";
            }

            emailBody +=
                    "Best regards,\n"
                            + "Car Services Team";

            message.setText(emailBody);

            mailSender.send(message);

            log.info(
                    "Technician status email sent to {}",
                    toEmail
            );

        } catch (Exception ex) {

            log.error(
                    "Failed to send technician status email to {}",
                    toEmail,
                    ex
            );

            throw new EmailSendingException(
                    "Failed to send technician status email"
            );
        }
    }





    @Override
    @Async
    public void sendTrackingEmail(String toEmail, String fullName, String trackingLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);

            message.setSubject("Car Services - Track Your Technician");

            String emailBody =
                    "Dear " + fullName + ",\n\n"
                            + "Your service request has been accepted "
                            + "and a technician has been assigned to you.\n\n"
                            + "You can track your technician's location "
                            + "and service status using the link below:\n\n"
                            + trackingLink + "\n\n"
                            + "You do not need to log in to track your request.\n\n"
                            + "Best regards,\n"
                            + "Car Services Team";

            message.setText(emailBody);
            mailSender.send(message);
            log.info("Tracking email sent to {}", toEmail);

        } catch (Exception ex) {
            log.error("Failed to send tracking email to {}", toEmail, ex);

            throw new EmailSendingException("Failed to send tracking email");
        }
    }





}
