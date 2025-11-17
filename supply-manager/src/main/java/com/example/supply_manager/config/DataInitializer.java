package com.example.supply_manager.config;

import com.example.supply_manager.model.User;
import com.example.supply_manager.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Criar usuário admin se não existir
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@supplymanager.com");
                admin.setFullName("Administrador");
                admin.setRole(User.Role.ADMIN);
                admin.setActive(true);
                
                userRepository.save(admin);
                System.out.println("Usuário admin criado com sucesso!");
                System.out.println("Usuário: admin");
                System.out.println("Senha: admin123");
            }

            // Criar usuário de teste se não existir
            if (!userRepository.existsByUsername("usuario")) {
                User user = new User();
                user.setUsername("usuario");
                user.setPassword(passwordEncoder.encode("123456"));
                user.setEmail("usuario@supplymanager.com");
                user.setFullName("Usuário Teste");
                user.setRole(User.Role.USER);
                user.setActive(true);
                
                userRepository.save(user);
                System.out.println("Usuário de teste criado com sucesso!");
                System.out.println("Usuário: usuario");
                System.out.println("Senha: 123456");
            }
        };
    }
}
