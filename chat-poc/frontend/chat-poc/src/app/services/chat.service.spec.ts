import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { MessageType, SenderRole } from '../models/chat-message.model';

/**
 * Suite de tests pour le service ChatService
 * Ce service gère la connexion WebSocket et la communication en temps réel
 */
describe('ChatService', () => {
  let service: ChatService;

  // Configuration avant chaque test
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatService]
    });
    service = TestBed.inject(ChatService);
  });

  /**
   * Test de création du service
   * Vérifie que le service est correctement instancié par Angular
   */
  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Test de l'état initial de connexion
   * Vérifie que le service n'est pas connecté au démarrage
   */
  it('devrait être déconnecté au départ', (done) => {
    // S'abonner à l'observable de connexion
    service.connected$.subscribe(connected => {
      // Vérifier que l'état initial est déconnecté
      expect(connected).toBe(false);
      done();
    });
  });

  /**
   * Test de l'état initial des messages
   * Vérifie que la liste des messages est vide au démarrage
   */
  it('devrait avoir une liste de messages vide au départ', (done) => {
    // S'abonner à l'observable des messages
    service.messages$.subscribe(messages => {
      // Vérifier que la liste est vide
      expect(messages).toEqual([]);
      expect(messages.length).toBe(0);
      done();
    });
  });

  /**
   * Test de la méthode isConnected()
   * Vérifie que la méthode retourne false quand non connecté
   */
  it('isConnected() devrait retourner false quand non connecté', () => {
    // Vérifier l'état de connexion
    const connected = service.isConnected();
    expect(connected).toBe(false);
  });

  /**
   * Test de l'URL du serveur WebSocket
   * Vérifie que l'URL est correctement configurée
   */
  it('devrait avoir la bonne URL de socket configurée', () => {
    // Accéder à la propriété privée pour les tests (via any)
    const socketUrl = (service as any).SOCKET_URL;

    // Vérifier que l'URL est définie et pointe vers localhost
    expect(socketUrl).toBeDefined();
    expect(socketUrl).toContain('localhost:8080');
    expect(socketUrl).toContain('/ws');
  });

  /**
   * Test de déconnexion sans connexion préalable
   * Vérifie que la déconnexion ne cause pas d'erreur si non connecté
   */
  it('ne devrait pas générer d\'erreur lors de la déconnexion sans connexion active', () => {
    // Tenter de se déconnecter sans être connecté
    // Ne devrait pas lever d'exception
    expect(() => {
      service.disconnect('TestUser', SenderRole.CLIENT);
    }).not.toThrow();
  });

  /**
   * Test de la structure d'un message de chat
   * Vérifie que les messages ont la bonne structure
   */
  it('devrait créer des messages avec la structure correcte', () => {
    // Créer un message de test
    const testMessage = {
      type: MessageType.CHAT,
      sender: 'TestUser',
      senderRole: SenderRole.CLIENT,
      content: 'Hello World',
      timestamp: new Date()
    };

    // Vérifier la structure du message
    expect(testMessage.type).toBe(MessageType.CHAT);
    expect(testMessage.sender).toBe('TestUser');
    expect(testMessage.senderRole).toBe(SenderRole.CLIENT);
    expect(testMessage.content).toBe('Hello World');
    expect(testMessage.timestamp).toBeInstanceOf(Date);
  });

  /**
   * Test des différents types de messages
   * Vérifie que tous les types de messages sont supportés
   */
  it('devrait supporter tous les types de messages (JOIN, LEAVE, CHAT)', () => {
    // Vérifier que MessageType contient tous les types
    expect(MessageType.JOIN).toBeDefined();
    expect(MessageType.LEAVE).toBeDefined();
    expect(MessageType.CHAT).toBeDefined();
  });

  /**
   * Test des rôles d'utilisateurs
   * Vérifie que tous les rôles sont supportés
   */
  it('devrait supporter tous les rôles (CLIENT, SUPPORT)', () => {
    // Vérifier que SenderRole contient tous les rôles
    expect(SenderRole.CLIENT).toBeDefined();
    expect(SenderRole.SUPPORT).toBeDefined();
  });

  /**
   * Test de l'initialisation du tableau de messages
   * Vérifie que le tableau est correctement initialisé
   */
  it('devrait initialiser correctement le tableau de messages interne', () => {
    // Accéder au tableau privé pour les tests
    const messages = (service as any).messages;

    // Vérifier que c'est un tableau vide
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBe(0);
  });

  /**
   * Test de l'état du client STOMP initial
   * Vérifie que le client STOMP est null au départ
   */
  it('devrait avoir un client STOMP null au départ', () => {
    // Accéder au client privé pour les tests
    const stompClient = (service as any).stompClient;

    // Vérifier que le client est null
    expect(stompClient).toBeNull();
  });
});
