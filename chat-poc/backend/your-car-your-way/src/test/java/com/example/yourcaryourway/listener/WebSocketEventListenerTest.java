package com.example.yourcaryourway.listener;


import com.example.yourcaryourway.model.ChatMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour WebSocketEventListener
 *
 * Vérifie que les déconnexions sont correctement gérées
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du WebSocketEventListener")
class WebSocketEventListenerTest {

    @Mock
    private SimpMessageSendingOperations messagingTemplate;

    @Captor
    private ArgumentCaptor<ChatMessage> messageCaptor;

    private WebSocketEventListener listener;

    @BeforeEach
    void setUp() {
        listener = new WebSocketEventListener(messagingTemplate);
    }

    /**
     * Méthode helper pour créer un SessionDisconnectEvent avec des attributs de session
     */
    private SessionDisconnectEvent createDisconnectEvent(String username, ChatMessage.SenderRole role) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.create(StompCommand.DISCONNECT);

        Map<String, Object> sessionAttributes = new HashMap<>();
        if (username != null) {
            sessionAttributes.put("username", username);
        }
        if (role != null) {
            sessionAttributes.put("role", role);
        }

        headerAccessor.setSessionAttributes(sessionAttributes);

        Message<byte[]> message = MessageBuilder.createMessage(
                new byte[0],
                headerAccessor.getMessageHeaders()
        );

        return new SessionDisconnectEvent(this, message, "sessionId", null);
    }

    @Test
    @DisplayName("Devrait envoyer un message LEAVE quand un utilisateur se déconnecte")
    void shouldSendLeaveMessageWhenUserDisconnects() {
        // Given
        String username = "Jean Dupont";
        ChatMessage.SenderRole role = ChatMessage.SenderRole.CLIENT;

        SessionDisconnectEvent event = createDisconnectEvent(username, role);

        // When
        listener.handleWebSocketDisconnectListener(event);

        // Then
        verify(messagingTemplate).convertAndSend(
                eq("/topic/public"),
                messageCaptor.capture()
        );

        ChatMessage sentMessage = messageCaptor.getValue();
        assertThat(sentMessage).isNotNull();
        assertThat(sentMessage.getType()).isEqualTo(ChatMessage.MessageType.LEAVE);
        assertThat(sentMessage.getSender()).isEqualTo(username);
        assertThat(sentMessage.getSenderRole()).isEqualTo(role);
        assertThat(sentMessage.getContent()).contains(username);
        assertThat(sentMessage.getContent()).contains("quitté");
    }

    @Test
    @DisplayName("Ne devrait rien envoyer si username est null")
    void shouldNotSendMessageWhenUsernameIsNull() {
        // Given - Pas de username
        SessionDisconnectEvent event = createDisconnectEvent(null, null);

        // When
        listener.handleWebSocketDisconnectListener(event);

        // Then
        verify(messagingTemplate, never()).convertAndSend(anyString(), (Object) any());
    }

    @Test
    @DisplayName("Devrait gérer un rôle null en utilisant CLIENT par défaut")
    void shouldHandleNullRoleByDefaultingToClient() {
        // Given
        String username = "Test User";
        // Role est null
        SessionDisconnectEvent event = createDisconnectEvent(username, null);

        // When
        listener.handleWebSocketDisconnectListener(event);

        // Then
        verify(messagingTemplate).convertAndSend(
                eq("/topic/public"),
                messageCaptor.capture()
        );

        ChatMessage sentMessage = messageCaptor.getValue();
        assertThat(sentMessage.getSenderRole()).isEqualTo(ChatMessage.SenderRole.CLIENT);
    }

    @Test
    @DisplayName("Devrait gérer les déconnexions de plusieurs types d'utilisateurs")
    void shouldHandleDisconnectionsForDifferentUserTypes() {
        // Test avec CLIENT
        SessionDisconnectEvent clientEvent = createDisconnectEvent("Client User", ChatMessage.SenderRole.CLIENT);

        listener.handleWebSocketDisconnectListener(clientEvent);

        verify(messagingTemplate).convertAndSend(eq("/topic/public"), messageCaptor.capture());
        assertThat(messageCaptor.getValue().getSenderRole()).isEqualTo(ChatMessage.SenderRole.CLIENT);

        // Reset mock
        reset(messagingTemplate);

        // Test avec SUPPORT
        SessionDisconnectEvent supportEvent = createDisconnectEvent("Support Agent", ChatMessage.SenderRole.SUPPORT);

        listener.handleWebSocketDisconnectListener(supportEvent);

        verify(messagingTemplate).convertAndSend(eq("/topic/public"), messageCaptor.capture());
        assertThat(messageCaptor.getValue().getSenderRole()).isEqualTo(ChatMessage.SenderRole.SUPPORT);
    }

    @Test
    @DisplayName("Devrait générer un ID et un timestamp pour le message LEAVE")
    void shouldGenerateIdAndTimestampForLeaveMessage() {
        // Given
        SessionDisconnectEvent event = createDisconnectEvent("User", ChatMessage.SenderRole.CLIENT);

        // When
        listener.handleWebSocketDisconnectListener(event);

        // Then
        verify(messagingTemplate).convertAndSend(
                eq("/topic/public"),
                messageCaptor.capture()
        );

        ChatMessage sentMessage = messageCaptor.getValue();
        assertThat(sentMessage.getId()).isNotNull();
        assertThat(sentMessage.getTimestamp()).isNotNull();
    }
}
