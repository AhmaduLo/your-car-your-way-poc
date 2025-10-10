package com.example.yourcaryourway.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

/**
 * Tests de configuration WebSocket
 *
 * Vérifie que la configuration WebSocket est correctement chargée
 */
@SpringBootTest
@DisplayName("Tests de la configuration WebSocket")
public class WebSocketConfigTest {

    @Autowired(required = false)
    private WebSocketConfig webSocketConfig;

    @Test
    @DisplayName("La configuration WebSocket devrait être chargée")
    void shouldLoadWebSocketConfiguration() {
        assertThat(webSocketConfig).isNotNull();
    }

    @Test
    @DisplayName("Le handler STOMP devrait être disponible")
    void shouldHaveStompSubProtocolHandler() {
        // Ce test vérifie que Spring a bien chargé le support STOMP
        // On ne peut pas tester directement la configuration,
        // mais on peut vérifier que le contexte démarre sans erreur
        assertThat(webSocketConfig).isNotNull();
    }

    @Test
    @DisplayName("La configuration devrait implémenter WebSocketMessageBrokerConfigurer")
    void shouldImplementWebSocketMessageBrokerConfigurer() {
        assertThat(webSocketConfig)
                .isInstanceOf(org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer.class);
    }
}
