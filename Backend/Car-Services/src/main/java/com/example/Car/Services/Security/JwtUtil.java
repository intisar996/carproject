package com.example.Car.Services.Security;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {


    private static final long JWT_TOKEN_VALIDITY = 30L * 24 * 60 * 60 * 1000;


    @Value("${jwt.secret:defaultSecretKeyForCarServiceappdefaultSecretKeyForCarServiceappdefaultSecretKeyForCarServiceapp}")
    private String secret;


    private SecretKey getSigningKey(){
        return Keys.hmacShaKeyFor(secret.getBytes());
    }


    public   String getUsernameFromToken(String token){
           return  getClaimFromToken(token,Claims::getSubject );
    }


    public String getRoleFromToken(String token){
        return getClaimFromToken(token, claims -> claims.get("role", String.class));

    }


    public Date getExpirationDateFromToken(String token){
        return getClaimFromToken(token, Claims::getExpiration);
      }

    private <T> T getClaimFromToken(String token, Function<Claims,T> claimResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimResolver.apply(claims);

    }

    private Claims getAllClaimsFromToken(String token){
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();



    }




    private Boolean isTokenExpired(String token){
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }


    public String generateToken(Long userId, String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        return doGenerateToken(claims, username);
    }


    public Long getUserIdFromToken(String token) {
        return getClaimFromToken(token, claims -> claims.get("userId", Long.class));
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY))
                .signWith(getSigningKey())
                .compact();


    }



    public Boolean validateToken(String token) {
        getAllClaimsFromToken(token);
        return !isTokenExpired(token);
    }


}
