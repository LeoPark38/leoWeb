package com.example.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/a")
public class ApiController {

    @GetMapping("/api/message")
    public Map<String, String> getMessage() {
    	System.out.println("------ api Message");
    	
    	
    	
    	
    	
    	
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello, this is a message from the server!");
        return response;
    }
}
