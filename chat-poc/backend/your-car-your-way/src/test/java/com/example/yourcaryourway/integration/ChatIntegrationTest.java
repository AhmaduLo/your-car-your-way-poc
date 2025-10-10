package com.example.yourcaryourway.integration;


import com.example.yourcaryourway.model.ChatMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

/**
 * Tests d'intégration pour le système de chat WebSocket
 *
 * Ces tests vérifient que l'ensemble de la chaîne fonctionne :
 * Client → WebSocket → Controller → Broadcast → Clients
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("Tests d'intégration du chat WebSocket")
public class ChatIntegrationTest {

    @LocalServerPort
    private int port;

    private WebSocketStompClient stompClient;
    private String wsUrl;

    @BeforeEach
    void setUp() {
        wsUrl = "http://localhost:" + port + "/ws";

        List<Transport> transports = new ArrayList<>();
        transports.add(new WebSocketTransport(new StandardWebSocketClient()));

        SockJsClient sockJsClient = new SockJsClient(transports);
        stompClient = new WebSocketStompClient(sockJsClient);

        // Configurer le converter avec le support des dates Java 8
        MappingJackson2MessageConverter messageConverter = new MappingJackson2MessageConverter();
        messageConverter.getObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        messageConverter.getObjectMapper().disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        stompClient.setMessageConverter(messageConverter);
    }

    @Test
    @DisplayName("Devrait se connecter au serveur WebSocket")
    void shouldConnectToWebSocketServer() throws Exception {
        // Given
        CompletableFuture<StompSession> future = new CompletableFuture<>();

        // When
        stompClient.connectAsync(wsUrl, new StompSessionHandlerAdapter() {
            @Override
            public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                future.complete(session);
            }
        });

        StompSession session = future.get(5, TimeUnit.SECONDS);

        // Then
        assertThat(session).isNotNull();
        assertThat(session.isConnected()).isTrue();

        // Cleanup
        session.disconnect();
    }

    @Test
    @DisplayName("Devrait recevoir un message après l'avoir envoyé")
    void shouldReceiveMessageAfterSending() throws Exception {
        // Given
        CompletableFuture<StompSession> sessionFuture = new CompletableFuture<>();
        CompletableFuture<ChatMessage> messageFuture = new CompletableFuture<>();

        // Connect
        stompClient.connectAsync(wsUrl, new StompSessionHandlerAdapter() {
            @Override
            public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                sessionFuture.complete(session);
            }
        });

        StompSession session = sessionFuture.get(5, TimeUnit.SECONDS);

        // Subscribe to topic
        session.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ChatMessage.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                messageFuture.complete((ChatMessage) payload);
            }
        });

        // When - Send message
        ChatMessage sentMessage = new ChatMessage(
                ChatMessage.MessageType.CHAT,
                "Test User",
                ChatMessage.SenderRole.CLIENT,
                "Test message from integration test"
        );

        session.send("/app/chat.sendMessage", sentMessage);

        // Then - Should receive the message
        ChatMessage receivedMessage = messageFuture.get(5, TimeUnit.SECONDS);

        assertThat(receivedMessage).isNotNull();
        assertThat(receivedMessage.getSender()).isEqualTo("Test User");
        assertThat(receivedMessage.getContent()).isEqualTo("Test message from integration test");
        assertThat(receivedMessage.getType()).isEqualTo(ChatMessage.MessageType.CHAT);

        // Cleanup
        session.disconnect();
    }

    @Test
    @DisplayName("Devrait diffuser le message à plusieurs clients")
    void shouldBroadcastMessageToMultipleClients() throws Exception {
        // Given - Two clients
        CompletableFuture<StompSession> session1Future = new CompletableFuture<>();
        CompletableFuture<StompSession> session2Future = new CompletableFuture<>();
        CompletableFuture<ChatMessage> client1Message = new CompletableFuture<>();
        CompletableFuture<ChatMessage> client2Message = new CompletableFuture<>();

        // Connect client 1
        stompClient.connectAsync(wsUrl, new StompSessionHandlerAdapter() {
            @Override
            public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                session1Future.complete(session);
            }
        });

        // Connect client 2
        stompClient.connectAsync(wsUrl, new StompSessionHandlerAdapter() {
            @Override
            public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                session2Future.complete(session);
            }
        });

        StompSession session1 = session1Future.get(5, TimeUnit.SECONDS);
        StompSession session2 = session2Future.get(5, TimeUnit.SECONDS);

        // Both clients subscribe
        session1.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ChatMessage.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                client1Message.complete((ChatMessage) payload);
            }
        });

        session2.subscribe("/topic/public", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ChatMessage.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                client2Message.complete((ChatMessage) payload);
            }
        });

        // When - Client 1 sends a message
        ChatMessage message = new ChatMessage(
                ChatMessage.MessageType.CHAT,
                "Client 1",
                ChatMessage.SenderRole.CLIENT,
                "Broadcast test"
        );

        session1.send("/app/chat.sendMessage", message);

        // Then - Both clients should receive it
        ChatMessage msg1 = client1Message.get(5, TimeUnit.SECONDS);
        ChatMessage msg2 = client2Message.get(5, TimeUnit.SECONDS);

        assertThat(msg1.getContent()).isEqualTo("Broadcast test");
        assertThat(msg2.getContent()).isEqualTo("Broadcast test");

        // Cleanup
        session1.disconnect();
        session2.disconnect();
    }
}
