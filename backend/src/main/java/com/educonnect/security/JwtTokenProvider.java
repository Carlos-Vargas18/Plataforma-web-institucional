package com.educonnect.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret:}")
    private String jwtSecretConfig;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        if (jwtSecretConfig != null && !jwtSecretConfig.isBlank()) {
            try {
                byte[] keyBytes = Decoders.BASE64.decode(jwtSecretConfig.trim());
                if (keyBytes.length >= 32) {
                    this.signingKey = Keys.hmacShaKeyFor(keyBytes);
                    return;
                }
            } catch (Exception ignored) {
                // Si no es Base64 válido, derivar 256 bits con SHA-256 desde la cadena configurada
            }
            try {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(jwtSecretConfig.trim().getBytes(StandardCharsets.UTF_8));
                this.signingKey = Keys.hmacShaKeyFor(hash);
            } catch (Exception e) {
                this.signingKey = Jwts.SIG.HS256.key().build();
            }
        } else {
            // Clave efímera generada con CSPRNG cuando no se provee variable de entorno en dev/test
            this.signingKey = Jwts.SIG.HS256.key().build();
        }
    }

    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public boolean validarToken(String authToken) {
        return validateToken(authToken);
    }

    public String obtenerEmailDelToken(String token) {
        return getUsernameFromJWT(token);
    }
}
