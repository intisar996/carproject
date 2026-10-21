package com.example.Car.Services.Controller.Commn;


import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class NotificationController {


     @MessageMapping("/sendMessage")
     @SendTo("/topic/notifications")

     public String sendMessage(String message){
         System.out.println("Received message: " + message);
         return message;
     }



}
