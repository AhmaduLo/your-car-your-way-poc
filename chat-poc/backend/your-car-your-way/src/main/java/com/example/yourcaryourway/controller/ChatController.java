package com.example.yourcaryourway.controller;

import com.example.yourcaryourway.model.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

/**
 * Contrôleur gérant les messages du chat
 *
 * Ce contrôleur reçoit les messages des clients via WebSocket
 * et les redistribue à tous les utilisateurs connectés
 */

@Controller
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    /**
     * Gère l'envoi d'un message de chat
     * Flux :
     * 1. Client envoie un message vers /app/chat.sendMessage
     * 2. Le serveur reçoit le message ici
     * 3. Le serveur diffuse le message vers /topic/public
     * 4. Tous les clients abonnés à /topic/public reçoivent le message
     *
     * @param chatMessage Le message envoyé par un utilisateur
     * @return Le message qui sera diffusé à tous les clients
     */
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        logger.info("Message reçu de {} ({}): {}",
                chatMessage.getSender(),
                chatMessage.getSenderRole(),
                chatMessage.getContent());

        // Le message est automatiquement diffusé à tous les abonnés de /topic/public
        return chatMessage;
    }

    /**
     * Gère l'arrivée d'un nouvel utilisateur dans le chat
     * Flux :
     * 1. Client se connecte et envoie un message vers /app/chat.addUser
     * 2. Le serveur enregistre le nom d'utilisateur dans la session WebSocket
     * 3. Un message "JOIN" est diffusé à tous pour annoncer l'arrivée
     *
     * @param chatMessage Message contenant le nom de l'utilisateur
     * @param headerAccessor Pour accéder aux attributs de session WebSocket
     * @return Message d'annonce diffusé à tous
     */

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(
            @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {

        // Stocke le nom d'utilisateur dans la session WebSocket
        // Cela permet de savoir qui se déconnecte plus tard
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        headerAccessor.getSessionAttributes().put("role", chatMessage.getSenderRole());

        logger.info("Nouvel utilisateur connecté : {} ({})",
                chatMessage.getSender(),
                chatMessage.getSenderRole());

        // Diffuse un message JOIN à tous les utilisateurs
        return chatMessage;
    }
}
