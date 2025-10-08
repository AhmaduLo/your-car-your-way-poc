package com.example.yourcaryourway.chat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principale de l'application Chat PoC
 *
 * Your Car Your Way - Proof of Concept
 * Chat en temps réel pour le service client
 *
 * Cette application démontre :
 * - Communication WebSocket bidirectionnelle
 * - Envoi/réception de messages en temps réel
 * - Gestion des connexions/déconnexions
 * - Broadcast des messages à tous les utilisateurs
 *
 * Pour démarrer l'application :
 * 1. Exécuter cette classe
 * 2. L'application démarre sur http://localhost:8080
 * 3. WebSocket disponible sur ws://localhost:8080/api/ws
 *
 * @author Your Car Your Way - Équipe technique
 * @version 1.0.0
 */

@SpringBootApplication
public class ChatPocApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatPocApplication.class, args);

        System.out.println("\n" +
                "========================================\n" +
                "  Your Car Your Way - Chat PoC        \n" +
                "========================================\n" +
                "  Application démarrée avec succès !  \n" +
                "  URL Backend: http://localhost:8080  \n" +
                "  WebSocket: ws://localhost:8080/api/ws\n" +
                "========================================\n");
    }
}
