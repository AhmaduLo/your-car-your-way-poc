package com.example.yourcaryourway.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

/**
 * Tests unitaires pour ChatMessage
 *
 * Ces tests vérifient que le modèle ChatMessage fonctionne correctement
 */
@DisplayName("Tests du modèle ChatMessage")
public class ChatMessageTest {

    @Test
    @DisplayName("Devrait créer un message avec tous les champs")
    void shouldCreateChatMessageWithAllFields() {

        // Given (Préparation)
        String sender = "Jean Dupont";
        ChatMessage.SenderRole role = ChatMessage.SenderRole.CLIENT;
        String content = "Bonjour, j'ai besoin d'aide";
        LocalDateTime now = LocalDateTime.now();

        // When (Action)
        ChatMessage message = new ChatMessage(
                ChatMessage.MessageType.CHAT,
                sender,
                role,
                content
        );
        message.setTimestamp(now);

        // Then (Vérification)
        assertThat(message.getType()).isEqualTo(ChatMessage.MessageType.CHAT);
        assertThat(message.getSender()).isEqualTo(sender);
        assertThat(message.getSenderRole()).isEqualTo(role);
        assertThat(message.getContent()).isEqualTo(content);
        assertThat(message.getTimestamp()).isEqualTo(now);
        assertThat(message.getId()).isNotNull();
    }

    @Test
    @DisplayName("Devrait créer un message JOIN")
    void shouldCreateJoinMessage() {
        // Given
        String username = "Sophie Support";
        ChatMessage.SenderRole role = ChatMessage.SenderRole.SUPPORT;

        // When
        ChatMessage message = new ChatMessage(
                ChatMessage.MessageType.JOIN,
                username,
                role,
                username + " a rejoint le chat"
        );

        // Then
        assertThat(message.getType()).isEqualTo(ChatMessage.MessageType.JOIN);
        assertThat(message.getSender()).isEqualTo(username);
        assertThat(message.getSenderRole()).isEqualTo(role);
        assertThat(message.getContent()).contains("a rejoint");
    }

    @Test
    @DisplayName("Devrait créer un message LEAVE")
    void shouldCreateLeaveMessage() {
        // Given
        String username = "Jean Dupont";

        // When
        ChatMessage message = new ChatMessage(
                ChatMessage.MessageType.LEAVE,
                username,
                ChatMessage.SenderRole.CLIENT,
                username + " a quitté le chat"
        );

        // Then
        assertThat(message.getType()).isEqualTo(ChatMessage.MessageType.LEAVE);
        assertThat(message.getContent()).contains("quitté");
    }

    @Test
    @DisplayName("Deux messages devraient avoir des IDs différents")
    void shouldHaveDifferentIds() {
        // Given & When
        ChatMessage message1 = new ChatMessage(ChatMessage.MessageType.CHAT, "User1", ChatMessage.SenderRole.CLIENT, "Hello");
        ChatMessage message2 = new ChatMessage(ChatMessage.MessageType.CHAT, "User2", ChatMessage.SenderRole.SUPPORT, "Hi");

        // Then
        assertThat(message1.getId()).isNotEqualTo(message2.getId());
    }

    @Test
    @DisplayName("Le timestamp devrait être automatiquement généré")
    void shouldAutomaticallyGenerateTimestamp() {
        // When
        ChatMessage message = new ChatMessage(
                ChatMessage.MessageType.CHAT,
                "Test User",
                ChatMessage.SenderRole.CLIENT,
                "Test message"
        );

        // Then
        assertThat(message.getTimestamp()).isNotNull();
        assertThat(message.getTimestamp()).isBefore(LocalDateTime.now().plusSeconds(1));
    }
}
