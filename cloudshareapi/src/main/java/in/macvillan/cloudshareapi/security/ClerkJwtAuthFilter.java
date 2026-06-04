package in.macvillan.cloudshareapi.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.PublicKey;
import java.util.Base64;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class ClerkJwtAuthFilter extends OncePerRequestFilter {

    @Value("${clerk.issuer}")
    private String clerkIssuer;

    private final ClerkJwksProvider jwksProvider;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI().substring(request.getContextPath().length());

        // Fully public: skip JWT entirely
        if (path.isEmpty() ||
                path.equals("/") ||
                path.startsWith("/webhooks") ||
                path.startsWith("/files/public") ||
                path.startsWith("/health")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Optional auth: attempt JWT if present, but never block — needed so owners can
        // download their own private files while unauthenticated users can only get public ones
        if (path.startsWith("/files/download")) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    trySetAuthentication(authHeader.substring(7));
                } catch (Exception ignored) {
                    // Invalid token on optional-auth path: treat as unauthenticated, don't block
                }
            }
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Authorization header missing/invalid");
            return;
        }

        try {
            trySetAuthentication(authHeader.substring(7));
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Invalid JWT token: " + e.getMessage());
        }
    }

    private void trySetAuthentication(String token) throws Exception {
        String[] chunks = token.split("\\.");
        if (chunks.length < 3) {
            throw new Exception("Invalid JWT token format");
        }

        String headerJson = new String(Base64.getUrlDecoder().decode(chunks[0]));
        ObjectMapper mapper = new ObjectMapper();
        JsonNode headerNode = mapper.readTree(headerJson);

        if (!headerNode.has("kid")) {
            throw new Exception("Token header is missing kid");
        }

        String kid = headerNode.get("kid").asText();
        PublicKey publicKey = jwksProvider.getPublicKey(kid);

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(publicKey)
                .setAllowedClockSkewSeconds(60)
                .requireIssuer(clerkIssuer)
                .build()
                .parseClaimsJws(token)
                .getBody();

        String clerkId = claims.getSubject();
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                clerkId, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }
}
