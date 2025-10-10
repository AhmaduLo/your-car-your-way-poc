package com.example.yourcaryourway.controller;


import com.example.yourcaryourway.model.ChatMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

/**
 * Tests unitaires pour ChatController
 *
 * On teste que les messages sont bien traités et retournés
 */
@DisplayName("Tests du contrôleur ChatController")
public class ChatControllerTest {

    private ChatController chatController;

    @BeforeEach
    public void beforeEach() {
        chatController = new ChatController();
    }

    @Test
    @DisplayName("Devrait retourner le message envoyé")
    void shouldReturnSentMessage() {
        // Given
        ChatMessage inputMessage = new ChatMessage(
                ChatMessage.MessageType.CHAT,
                "Jean Dupont",
                ChatMessage.SenderRole.CLIENT,
                "Bonjour !"
        );

        // When
        ChatMessage returnedMessage = chatController.sendMessage(inputMessage);

        // Then
        assertThat(returnedMessage).isNotNull();
        assertThat(returnedMessage.getSender()).isEqualTo("Jean Dupont");
        assertThat(returnedMessage.getContent()).isEqualTo("Bonjour !");
        assertThat(returnedMessage.getType()).isEqualTo(ChatMessage.MessageType.CHAT);
    }

    @Test
    @DisplayName("Devrait gérer l'ajout d'un utilisateur")
    void shouldHandleAddUser() {
        // Given
        ChatMessage joinMessage = new ChatMessage(
                ChatMessage.MessageType.JOIN,
                "Sophie Support",
                ChatMessage.SenderRole.SUPPORT,
                "Sophie Support a rejoint le chat"
        );

        Map<String, Object> sessionAttributes = new HashMap<>();
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create();
        headerAccessor.setSessionAttributes(sessionAttributes);

        // When
        ChatMessage returnedMessage = chatController.addUser(joinMessage, headerAccessor);

        // Then
        assertThat(returnedMessage).isNotNull();
        assertThat(returnedMessage.getType()).isEqualTo(ChatMessage.MessageType.JOIN);
        assertThat(sessionAttributes.get("username")).isEqualTo("Sophie Support");
        assertThat(sessionAttributes.get("role")).isEqualTo(ChatMessage.SenderRole.SUPPORT);
    }

    @Test
    @DisplayName("Devrait stocker le username dans la session")
    void shouldStoreUsernameInSession() {
        // Given
        String username = "Test User";
        ChatMessage message = new ChatMessage(
                ChatMessage.MessageType.JOIN,
                username,
                ChatMessage.SenderRole.CLIENT,
                "Join message"
        );

        Map<String, Object> sessionAttributes = new HashMap<>();
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create();
        headerAccessor.setSessionAttributes(sessionAttributes);

        // When
        chatController.addUser(message, headerAccessor);

        // Then
        //assertThat(sessionAttributes).containsKey("username");
        assertThat(sessionAttributes.get("username")).isEqualTo(username);
    }

    @Test
    @DisplayName("Devrait stocker le role dans la session")
    void shouldStoreRoleInSession() {
        // Given
        ChatMessage.SenderRole role = ChatMessage.SenderRole.SUPPORT;
        ChatMessage message = new ChatMessage(
                ChatMessage.MessageType.JOIN,
                "Support Agent",
                role,
                "Join message"
        );

        Map<String, Object> sessionAttributes = new HashMap<>();
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create();
        headerAccessor.setSessionAttributes(sessionAttributes);

        // When
        chatController.addUser(message, headerAccessor);

        // Then
       // assertThat(sessionAttributes).containsKey("role");
        assertThat(sessionAttributes.get("role")).isEqualTo(role);
    }
}
