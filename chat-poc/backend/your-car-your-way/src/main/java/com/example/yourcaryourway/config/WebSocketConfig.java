package com.example.yourcaryourway.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuration WebSocket pour le chat en temps réel
 *
 * Cette classe configure :
 * - Le point de connexion WebSocket (/ws)
 * - Le broker de messages pour gérer les abonnements
 * - Les préfixes d'URL pour l'envoi et la réception de messages
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configure le broker de messages
     *
     * - /topic : utilisé pour les messages broadcast (tous les utilisateurs)
     * - /app : préfixe pour les messages envoyés par les clients
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Active un broker simple en mémoire
        // Les messages vers /topic seront diffusés à tous les abonnés
        registry.enableSimpleBroker("/topic");

        // Les messages des clients commenceront par /app
        // Exemple : /app/chat.sendMessage
        registry.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Configure les endpoints WebSocket
     *
     * - /ws : point de connexion principal
     * - SockJS : fallback pour les navigateurs qui ne supportent pas WebSocket
     * - CORS : autorise les connexions depuis Angular (localhost:4200)
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
                .addEndpoint("/ws")  // URL de connexion WebSocket
                .setAllowedOrigins("http://localhost:4200")  // Autorise Angular
                .withSockJS();  // SockJS est une couche de compatibilité. Si le navigateur ne supporte pas WebSocket natif, SockJS utilise d'autres techniques
    }
}