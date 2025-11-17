package com.example.supply_manager.controller;

import com.example.supply_manager.dto.AuthResponse;
import com.example.supply_manager.dto.LoginRequest;
import com.example.supply_manager.dto.RegisterRequest;
import com.example.supply_manager.model.User;
import com.example.supply_manager.service.JwtService;
import com.example.supply_manager.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    
    private final UserService userService;
    private final JwtService jwtService;
    
    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.register(request);
            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = userService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
