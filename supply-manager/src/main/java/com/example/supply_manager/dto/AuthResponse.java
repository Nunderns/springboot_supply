package com.example.supply_manager.dto;

import lombok.Data;
import com.example.supply_manager.model.User;

import java.time.LocalDateTime;

@Data
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private User.Role role;
    private LocalDateTime lastLogin;
    
    public AuthResponse(String token, User user) {
        this.token = token;
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.role = user.getRole();
        this.lastLogin = user.getLastLogin();
    }
}
