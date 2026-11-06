package com.roundtrip.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Destination prefixes for server-to-client subscriptions
        config.enableSimpleBroker("/topic", "/queue");
        // Application prefix for client-to-server messages
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Primary STOMP endpoint with SockJS fallback
        registry.addEndpoint("/ws-roundtrip")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Plain WebSocket endpoint for mobile clients / React Native
        registry.addEndpoint("/ws-roundtrip/websocket")
                .setAllowedOriginPatterns("*");
    }
}
