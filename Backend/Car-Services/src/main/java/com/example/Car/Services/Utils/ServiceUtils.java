package com.example.Car.Services.Utils;



import com.example.Car.Services.Repository.UserRepository;
import com.example.Car.Services.entities.User;
import com.example.Car.Services.expection.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
public class ServiceUtils {

    @Autowired
    private UserRepository userRepository;

      public User getUserByEmailOrThrow(String email){

         return  userRepository.findByEmail(email)
                 .orElseThrow(() -> new ResourceNotFoundException("user not found with email: " + email));
      }

      public User getUserByIdOrThrow(Long id){
          return userRepository
                  .findById(id)
                  .orElseThrow(() -> new ResourceNotFoundException("user not found with id:" + id));
      }








}
