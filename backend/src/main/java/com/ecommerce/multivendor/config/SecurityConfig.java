package com.ecommerce.multivendor.config;

import com.ecommerce.multivendor.exception.ApiError;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String SELLER = "ROLE_SELLER";
    private static final String CUSTOMER = "ROLE_CUSTOMER";

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                // Memakai bean "corsConfigurationSource" dari CorsConfig
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // Katalog publik
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories", "/api/stores").permitAll()

                        // Seller
                        .requestMatchers(HttpMethod.POST, "/api/products").hasAuthority(SELLER)
                        .requestMatchers(HttpMethod.PUT, "/api/products/{id}").hasAuthority(SELLER)
                        .requestMatchers(HttpMethod.DELETE, "/api/products/{id}").hasAuthority(SELLER)
                        .requestMatchers("/api/stores/**").hasAuthority(SELLER)

                        // Pesanan & pembayaran
                        .requestMatchers(HttpMethod.POST, "/api/orders").hasAuthority(CUSTOMER)
                        .requestMatchers(HttpMethod.GET, "/api/orders", "/api/orders/{id}")
                        .hasAnyAuthority(CUSTOMER, SELLER)
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/{id}/status")
                        .hasAnyAuthority(CUSTOMER, SELLER)
                        .requestMatchers("/api/payments/**").hasAuthority(CUSTOMER)

                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, e) ->
                                writeError(response, HttpStatus.UNAUTHORIZED, "Sesi tidak valid atau telah berakhir. Silakan login kembali."))
                        .accessDeniedHandler((request, response, e) ->
                                writeError(response, HttpStatus.FORBIDDEN, "Anda tidak memiliki akses ke sumber daya ini")))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private void writeError(jakarta.servlet.http.HttpServletResponse response, HttpStatus status, String message)
            throws java.io.IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), ApiError.of(status.value(), message));
    }
}
