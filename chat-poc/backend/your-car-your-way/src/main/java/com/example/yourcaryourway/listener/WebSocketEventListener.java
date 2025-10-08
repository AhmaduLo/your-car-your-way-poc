package com.example.yourcaryourway.listener;

import com.example.yourcaryourway.model.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * Listener qui écoute les événements WebSocket
 *
 * Gère spécifiquement les déconnexions des utilisateurs
 * pour annoncer leur départ aux autres utilisateurs
 */

public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final SimpMessageSendingOperations messagingTemplate;

    public WebSocketEventListener(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Appelé automatiquement quand un utilisateur se déconnecte
     *
     * Flux :
     * 1. Un utilisateur ferme son navigateur ou perd la connexion
     * 2. Spring détecte la déconnexion
     * 3. Cette méthode est appelée automatiquement
     * 4. On récupère le nom d'utilisateur depuis la session
     * 5. On diffuse un message LEAVE à tous les autres utilisateurs
     *
     * @param event L'événement de déconnexion contenant les infos de session
     */

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // Récupère le nom d'utilisateur depuis la session WebSocket
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        ChatMessage.SenderRole role = (ChatMessage.SenderRole) headerAccessor.getSessionAttributes().get("role");

        if (username != null) {
            logger.info("Utilisateur déconnecté : {} ({})", username, role);

            // Crée un message LEAVE pour annoncer le départ
            ChatMessage chatMessage = new ChatMessage(
                    ChatMessage.MessageType.LEAVE,
                    username,
                    role != null ? role : ChatMessage.SenderRole.CLIENT,
                    username + " a quitté le chat"
            );

            // Diffuse le message de départ à tous les utilisateurs connectés
            messagingTemplate.convertAndSend("/topic/public", chatMessage);
        }
    }
}
