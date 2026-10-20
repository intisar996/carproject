package com.example.Car.Services.Repository;

import com.example.Car.Services.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);

    Optional<User>  findByVerificationToken(String verificationToken);


    boolean existsByEmail(String email);


    Optional<User> findByPhone(String phone);

    boolean  existsByPhone(String phone);


    Optional<User> findByPasswordResetToken(String passwordRestToken);

    @Query("SELECT u FROM User u WHERE u.active=true")
    List<User> getAllUser();




}
