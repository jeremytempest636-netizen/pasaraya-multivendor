package com.ecommerce.multivendor.service;

import com.ecommerce.multivendor.config.JwtService;
import com.ecommerce.multivendor.dto.request.LoginRequest;
import com.ecommerce.multivendor.dto.request.RegisterRequest;
import com.ecommerce.multivendor.dto.response.AuthResponse;
import com.ecommerce.multivendor.exception.BadRequestException;
import com.ecommerce.multivendor.model.Role;
import com.ecommerce.multivendor.model.User;
import com.ecommerce.multivendor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email sudah terdaftar");
        }

        Role role = parseRole(request.role());
        User user = userRepository.save(User.builder()
                .name(request.name().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .role(role)
                .build());

        return toResponse("Registrasi berhasil", user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Email atau password salah"));

        return toResponse("Login berhasil", user);
    }

    private AuthResponse toResponse(String message, User user) {
        return new AuthResponse(message, jwtService.generate(user), user.getRole().name(), user.getEmail(), user.getName());
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    /** Menerima "CUSTOMER", "SELLER", atau bentuk "ROLE_..." ; ADMIN tidak bisa didaftarkan publik. */
    private static Role parseRole(String raw) {
        String value = raw.trim().toUpperCase(Locale.ROOT).replaceFirst("^ROLE_", "");
        return switch (value) {
            case "CUSTOMER" -> Role.ROLE_CUSTOMER;
            case "SELLER" -> Role.ROLE_SELLER;
            default -> throw new BadRequestException("Role harus CUSTOMER atau SELLER");
        };
    }
}
