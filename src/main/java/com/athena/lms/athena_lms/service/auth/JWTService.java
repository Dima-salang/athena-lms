package com.athena.lms.athena_lms.service.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import jakarta.annotation.PostConstruct;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.model.Student;

@Service
public class JWTService {
    @Value("${jwt.secret}")
    private String secretKey;
    
    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours

    public String generateToken(User user) {
        return Jwts.builder()
            .setSubject(user.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
            .claim("userType", user instanceof Student ? "student" : "teacher")
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public String getUserType(String token) {
        return parseClaims(token).get("userType", String.class);
    }

    public boolean isTokenExpired(String token) {
        Date expiration = parseClaims(token).getExpiration();
        return expiration.before(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}
