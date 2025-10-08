package com.example.yourcaryourway.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Modèle représentant un message de chat
 * Utilisé pour les échanges entre client et support
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    /**
     * Types de message possibles
     */
    public enum MessageType {
        JOIN,      // Un utilisateur rejoint le chat
        LEAVE,     // Un utilisateur quitte le chat
        CHAT       // Message normal de conversation
    }

    /**
     * Rôle de l'expéditeur du message
     */
    public enum SenderRole {
        CLIENT,    // Client qui a besoin d'aide
        SUPPORT    // Employé du support client
    }

    // Identifiant unique du message
    private String id;

    // Type de message (JOIN, LEAVE, CHAT)
    private MessageType type;

    // Nom de l'expéditeur
    private String sender;

    // Rôle de l'expéditeur (CLIENT ou SUPPORT)
    private SenderRole senderRole;

    // Contenu du message
    private String content;

    // Date et heure d'envoi
    private LocalDateTime timestamp;

    /**
     * Constructeur pour créer un message de chat
     */
    public ChatMessage(MessageType type, String sender, SenderRole senderRole, String content) {
        this.type = type;
        this.sender = sender;
        this.senderRole = senderRole;
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.id = java.util.UUID.randomUUID().toString();
    }
}