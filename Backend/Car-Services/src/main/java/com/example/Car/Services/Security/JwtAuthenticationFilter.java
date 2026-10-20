package com.example.Car.Services.Security;

import com.example.Car.Services.entities.User;
import com.example.Car.Services.enums.Role;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    @Qualifier("handlerExceptionResolver")
    private HandlerExceptionResolver resolver;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = extractJwtToken(request);

            if (jwt != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtUtil.validateToken(jwt)) {
                    String username = jwtUtil.getUsernameFromToken(jwt);
                    UserDetails userDetails = createUserDetailesFromToken(jwt, username);
                    setAuthenticationInContext(request, userDetails);
                }
            }

            filterChain.doFilter(request, response);

        } catch (io.jsonwebtoken.security.SignatureException ex) {
            writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or tampered JWT signature!");

        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "JWT token has expired. Please log in again.");

        } catch (io.jsonwebtoken.JwtException ex) {
            writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Malformed or invalid JWT token.");

        } catch (Exception ex) {
            resolver.resolveException(request, response, null, ex);
        }
    }

    private void writeErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");

        String jsonResponse = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"Unauthorized\",\"message\":\"%s\"}",
                java.time.Instant.now().toString(),
                status,
                message
        );

        response.getWriter().write(jsonResponse);
    }

    private String extractJwtToken(HttpServletRequest request) {
        final String authorizationHeader = request.getHeader("Authorization");
        final String requestURI = request.getRequestURI();

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        } else if ((requestURI.contains("api/files/video/") || requestURI.contains("api/files/image/"))
                && request.getParameter("token") != null) {
            return request.getParameter("token");
        }

        return null;
    }

    private boolean shouldProcessAuthentication(String username) {
        return username != null && SecurityContextHolder.getContext().getAuthentication() == null;
    }

    private void processAuthentication(HttpServletRequest request, String jwt, String username) {
        if (jwtUtil.validateToken(jwt)) {
            UserDetails userDetails = createUserDetailesFromToken(jwt, username);
            setAuthenticationInContext(request, userDetails);
        }
    }

    private UserDetails createUserDetailesFromToken(String jwt, String username) {
        String role = jwtUtil.getRoleFromToken(jwt);
        Long userId = jwtUtil.getUserIdFromToken(jwt);


        User user = new User();
        user.setId(userId);
        user.setEmail(username);
        user.setPassword("");
        user.setRole(Role.valueOf(role));
        user.setActive(true);

        return user;
    }

    private void setAuthenticationInContext(HttpServletRequest request, UserDetails userDetails) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);

        System.out.println("AUTHENTICATED = " +
                SecurityContextHolder.getContext().getAuthentication().isAuthenticated());

        System.out.println("AUTHORITIES = " +
                SecurityContextHolder.getContext().getAuthentication().getAuthorities());
    }


}