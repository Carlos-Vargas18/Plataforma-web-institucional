package com.educonnect.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost,https://localhost,capacitor://localhost}")
    private String allowedOriginsConfig;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                    response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"No autenticado o sesión expirada. Inicie sesión nuevamente.\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                    response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Acceso denegado: no tiene permisos para este recurso institucional.\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos estrictamente limitados a login y recuperación de clave
                .requestMatchers(
                    "/api/v1/auth/login",
                    "/api/v1/auth/olvide-password",
                    "/api/v1/auth/verificar-codigo",
                    "/api/v1/auth/restablecer-password"
                ).permitAll()
                // Registro de usuarios restringido exclusivamente a ADMIN
                .requestMatchers("/api/v1/auth/register").hasRole("ADMIN")
                // Perfil propio autenticado
                .requestMatchers("/api/v1/auth/me").authenticated()

                // Administración y configuración institucional
                .requestMatchers(HttpMethod.GET, "/api/v1/admin/**").hasAnyRole("ADMIN", "RECTOR", "COORDINADOR", "DIRECTOR_GRUPO", "DOCENTE")
                .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "RECTOR", "COORDINADOR")

                // Rectoría
                .requestMatchers("/api/v1/rector/**").hasAnyRole("RECTOR", "ADMIN")

                // Coordinación y Convivencia Escolar (Ley 1620)
                .requestMatchers("/api/v1/coordinador/**").hasAnyRole("COORDINADOR", "RECTOR", "ADMIN")
                .requestMatchers("/api/v1/convivencia/**").hasAnyRole("COORDINADOR", "RECTOR", "ADMIN", "DIRECTOR_GRUPO", "DOCENTE")

                // Calificaciones Decreto 1290
                .requestMatchers(HttpMethod.POST, "/api/v1/calificaciones/**").hasAnyRole("DOCENTE", "DIRECTOR_GRUPO", "COORDINADOR", "RECTOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/calificaciones/**").hasAnyRole("DOCENTE", "DIRECTOR_GRUPO", "COORDINADOR", "RECTOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/calificaciones/**").authenticated()

                // Asistencia y Justificaciones
                .requestMatchers(HttpMethod.POST, "/api/v1/asistencias/justificaciones/**").hasAnyRole("TUTOR", "ESTUDIANTE", "COORDINADOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/asistencias/**").hasAnyRole("DOCENTE", "DIRECTOR_GRUPO", "COORDINADOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/asistencias/**").hasAnyRole("DOCENTE", "DIRECTOR_GRUPO", "COORDINADOR", "RECTOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/asistencias/**").authenticated()

                // Horarios
                .requestMatchers(HttpMethod.POST, "/api/v1/horarios/**").hasAnyRole("ADMIN", "COORDINADOR", "RECTOR")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/horarios/**").hasAnyRole("ADMIN", "COORDINADOR", "RECTOR")
                .requestMatchers(HttpMethod.GET, "/api/v1/horarios/**").authenticated()

                // Comunicados
                .requestMatchers(HttpMethod.POST, "/api/v1/comunicados/**").hasAnyRole("ADMIN", "RECTOR", "COORDINADOR", "DIRECTOR_GRUPO", "DOCENTE")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/comunicados/**").hasAnyRole("ADMIN", "RECTOR", "COORDINADOR")
                .requestMatchers(HttpMethod.GET, "/api/v1/comunicados/**").authenticated()

                // Observador y Citaciones
                .requestMatchers(HttpMethod.POST, "/api/v1/observador/**").hasAnyRole("DOCENTE", "DIRECTOR_GRUPO", "COORDINADOR", "RECTOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/observador/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/v1/citaciones/**").hasAnyRole("DOCENTE", "DIRECTOR_GRUPO", "COORDINADOR", "RECTOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/citaciones/**").hasAnyRole("TUTOR", "DOCENTE", "DIRECTOR_GRUPO", "COORDINADOR", "RECTOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/citaciones/**").authenticated()

                // Boletines Oficiales
                .requestMatchers("/api/v1/boletines/**").authenticated()

                // Módulos específicos de Docente, Estudiante y Tutor
                .requestMatchers("/api/v1/docente/**").hasAnyRole("DOCENTE", "DIRECTOR_GRUPO", "COORDINADOR", "RECTOR", "ADMIN")
                .requestMatchers("/api/v1/estudiante/**").hasAnyRole("ESTUDIANTE", "TUTOR", "DOCENTE", "DIRECTOR_GRUPO", "COORDINADOR", "RECTOR", "ADMIN")
                .requestMatchers("/api/v1/tutor/**").hasAnyRole("TUTOR", "COORDINADOR", "RECTOR", "ADMIN")

                // Telemetría y Motor MIPA
                .requestMatchers("/api/v1/telemetria/**", "/api/v1/mipa/**").hasAnyRole("ADMIN", "RECTOR", "COORDINADOR", "DIRECTOR_GRUPO")

                // EduBot
                .requestMatchers("/api/v1/edubot/**").authenticated()

                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> originPatterns = new java.util.ArrayList<>(Arrays.stream(allowedOriginsConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList());
        originPatterns.add("http://localhost:*");
        originPatterns.add("http://127.0.0.1:*");
        originPatterns.add("http://192.168.*:*");
        originPatterns.add("http://10.*:*");
        originPatterns.add("http://172.*:*");
        originPatterns.add("https://*.trycloudflare.com");
        originPatterns.add("https://*.lhr.life");
        originPatterns.add("https://*.loca.lt");
        originPatterns.add("https://*.ngrok-free.app");
        originPatterns.add("https://*.ngrok.io");
        configuration.setAllowedOriginPatterns(originPatterns);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
