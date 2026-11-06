package com.roundtrip.config;

import com.roundtrip.security.ClerkAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final ClerkAuthenticationFilter clerkAuthFilter;

    public SecurityConfig(ClerkAuthenticationFilter clerkAuthFilter) {
        this.clerkAuthFilter = clerkAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // WebSocket endpoints
                        .requestMatchers("/ws-roundtrip/**").permitAll()
                        // Public API endpoints
                        .requestMatchers("/api/rooms/**").permitAll()
                        .requestMatchers("/api/scorecards/**").permitAll()
                        .requestMatchers("/api/users/**").permitAll()
                        .requestMatchers("/api/health/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .anyRequest().permitAll() // Allow open gameplay in dev/guest mode
                )
                .addFilterBefore(clerkAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
