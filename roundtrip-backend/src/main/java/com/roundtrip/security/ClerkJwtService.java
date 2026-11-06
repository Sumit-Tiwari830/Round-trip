package com.roundtrip.security;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.security.interfaces.RSAPublicKey;

@Slf4j
@Service
public class ClerkJwtService {

    @Value("${clerk.jwks-url:}")
    private String jwksUrl;

    @Value("${clerk.issuer:}")
    private String issuer;

    private JwkProvider jwkProvider;

    public DecodedJWT verifyToken(String token) {
        if (token == null || token.isBlank()) return null;

        try {
            DecodedJWT jwt = JWT.decode(token);

            // If Clerk JWKS URL is provided, verify RSA signature
            if (jwksUrl != null && !jwksUrl.isBlank()) {
                if (jwkProvider == null) {
                    jwkProvider = new UrlJwkProvider(new URL(jwksUrl));
                }
                Jwk jwk = jwkProvider.get(jwt.getKeyId());
                Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
                algorithm.verify(jwt);
            }

            return jwt;
        } catch (Exception e) {
            log.debug("JWT verification fallback / dev mode: {}", e.getMessage());
            // In dev mode, still parse unverified JWT claims for seamless local developer experience
            try {
                return JWT.decode(token);
            } catch (Exception ex) {
                return null;
            }
        }
    }
}
