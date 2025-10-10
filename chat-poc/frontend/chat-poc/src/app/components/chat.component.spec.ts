import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { ChatService } from '../services/chat.service';
import { ChatMessage, MessageType, SenderRole } from '../models/chat-message.model';
import { BehaviorSubject } from 'rxjs';

/**
 * Suite de tests pour le composant ChatComponent
 * Ce composant gère l'interface de messagerie du chat
 */
describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let mockChatService: any;
  let messagesSubject: BehaviorSubject<ChatMessage[]>;

  // Configuration avant chaque test
  beforeEach(async () => {
    // Créer un subject pour simuler l'observable des messages
    messagesSubject = new BehaviorSubject<ChatMessage[]>([]);

    // Créer un mock du service ChatService
    mockChatService = {
      sendMessage: jest.fn(),
      disconnect: jest.fn(),
      messages$: messagesSubject.asObservable()
    };

    // Configurer le module de test
    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        { provide: ChatService, useValue: mockChatService }
      ]
    }).compileComponents();

    // Créer le composant et obtenir les références
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;

    // Définir un utilisateur par défaut pour les tests
    component.currentUser = 'TestUser';
    component.currentRole = SenderRole.CLIENT;

    fixture.detectChanges();
  });

  /**
   * Test de création du composant
   * Vérifie que le composant est correctement instancié
   */
  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test de l'initialisation de la liste de messages
   * Vérifie que la liste démarre vide
   */
  it('devrait initialiser la liste de messages vide', () => {
    expect(component.messages).toEqual([]);
    expect(component.messages.length).toBe(0);
  });

  /**
   * Test de l'initialisation du contenu du message
   * Vérifie que le champ de saisie démarre vide
   */
  it('devrait initialiser messageContent vide', () => {
    expect(component.messageContent).toBe('');
  });

  /**
   * Test de l'exposition des enums au template
   * Vérifie que les enums sont disponibles pour le template
   */
  it('devrait exposer les enums MessageType et SenderRole au template', () => {
    expect(component.MessageType).toBe(MessageType);
    expect(component.SenderRole).toBe(SenderRole);
  });

  /**
   * Test de réception des messages via l'observable
   * Vérifie que le composant reçoit et affiche les messages du service
   */
  it('devrait recevoir et afficher les messages du service', () => {
    // Créer des messages de test
    const testMessages: ChatMessage[] = [
      {
        type: MessageType.CHAT,
        sender: 'User1',
        senderRole: SenderRole.CLIENT,
        content: 'Hello',
        timestamp: new Date()
      },
      {
        type: MessageType.CHAT,
        sender: 'User2',
        senderRole: SenderRole.SUPPORT,
        content: 'Hi there!',
        timestamp: new Date()
      }
    ];

    // Émettre les messages
    messagesSubject.next(testMessages);

    // Vérifier que le composant a reçu les messages
    expect(component.messages).toEqual(testMessages);
    expect(component.messages.length).toBe(2);
  });

  /**
   * Test d'envoi d'un message
   * Vérifie que l'envoi d'un message appelle le service correctement
   */
  it('devrait envoyer un message via le service', () => {
    // Définir le contenu du message
    component.messageContent = 'Test message';

    // Envoyer le message
    component.sendMessage();

    // Vérifier que le service a été appelé avec les bons paramètres
    expect(mockChatService.sendMessage).toHaveBeenCalledWith(
      'Test message',
      'TestUser',
      SenderRole.CLIENT
    );

    // Vérifier que le champ de saisie a été vidé
    expect(component.messageContent).toBe('');
  });

  /**
   * Test d'envoi d'un message vide
   * Vérifie que les messages vides ne sont pas envoyés
   */
  it('ne devrait pas envoyer un message vide', () => {
    // Définir un message vide
    component.messageContent = '';

    // Tenter d'envoyer le message
    component.sendMessage();

    // Vérifier que le service n'a pas été appelé
    expect(mockChatService.sendMessage).not.toHaveBeenCalled();
  });

  /**
   * Test d'envoi d'un message contenant uniquement des espaces
   * Vérifie que les messages avec seulement des espaces ne sont pas envoyés
   */
  it('ne devrait pas envoyer un message avec uniquement des espaces', () => {
    // Définir un message avec seulement des espaces
    component.messageContent = '   ';

    // Tenter d'envoyer le message
    component.sendMessage();

    // Vérifier que le service n'a pas été appelé
    expect(mockChatService.sendMessage).not.toHaveBeenCalled();
  });

  /**
   * Test de nettoyage des espaces autour du message
   * Vérifie que les espaces en début et fin sont supprimés
   */
  it('devrait supprimer les espaces autour du message avant l\'envoi', () => {
    // Définir un message avec des espaces
    component.messageContent = '  Hello World  ';

    // Envoyer le message
    component.sendMessage();

    // Vérifier que le message a été nettoyé
    expect(mockChatService.sendMessage).toHaveBeenCalledWith(
      'Hello World',
      'TestUser',
      SenderRole.CLIENT
    );
  });

  /**
   * Test de la touche Entrée pour envoyer un message
   * Vérifie que la touche Entrée déclenche l'envoi
   */
  it('devrait envoyer le message quand on appuie sur Entrée', () => {
    // Définir le contenu
    component.messageContent = 'Test message';

    // Créer un événement clavier simulé
    const event = new KeyboardEvent('keypress', { key: 'Enter' });
    jest.spyOn(event, 'preventDefault');

    // Espionner sendMessage
    jest.spyOn(component, 'sendMessage');

    // Appeler onKeyPress
    component.onKeyPress(event);

    // Vérifier que preventDefault a été appelé
    expect(event.preventDefault).toHaveBeenCalled();

    // Vérifier que sendMessage a été appelé
    expect(component.sendMessage).toHaveBeenCalled();
  });

  /**
   * Test de la touche Shift+Entrée
   * Vérifie que Shift+Entrée ne déclenche pas l'envoi (pour les sauts de ligne)
   */
  it('ne devrait pas envoyer le message avec Shift+Entrée', () => {
    // Définir le contenu
    component.messageContent = 'Test message';

    // Créer un événement avec Shift+Entrée
    const event = new KeyboardEvent('keypress', { key: 'Enter', shiftKey: true });
    jest.spyOn(event, 'preventDefault');

    // Espionner sendMessage
    jest.spyOn(component, 'sendMessage');

    // Appeler onKeyPress
    component.onKeyPress(event);

    // Vérifier que preventDefault n'a PAS été appelé
    expect(event.preventDefault).not.toHaveBeenCalled();

    // Vérifier que sendMessage n'a PAS été appelé
    expect(component.sendMessage).not.toHaveBeenCalled();
  });

  /**
   * Test d'identification des messages de l'utilisateur actuel
   * Vérifie que isOwnMessage détecte correctement les messages de l'utilisateur
   */
  it('devrait identifier correctement les messages de l\'utilisateur actuel', () => {
    // Créer un message de l'utilisateur actuel
    const ownMessage: ChatMessage = {
      type: MessageType.CHAT,
      sender: 'TestUser',
      senderRole: SenderRole.CLIENT,
      content: 'My message'
    };

    // Créer un message d'un autre utilisateur
    const otherMessage: ChatMessage = {
      type: MessageType.CHAT,
      sender: 'OtherUser',
      senderRole: SenderRole.SUPPORT,
      content: 'Other message'
    };

    // Vérifier la détection
    expect(component.isOwnMessage(ownMessage)).toBe(true);
    expect(component.isOwnMessage(otherMessage)).toBe(false);
  });

  /**
   * Test de la classe CSS pour les messages système (JOIN)
   * Vérifie que les messages JOIN ont la classe 'system'
   */
  it('devrait retourner la classe "system" pour les messages JOIN', () => {
    // Créer un message JOIN
    const joinMessage: ChatMessage = {
      type: MessageType.JOIN,
      sender: 'User1',
      senderRole: SenderRole.CLIENT,
      content: 'User1 a rejoint le chat'
    };

    // Vérifier la classe
    const cssClass = component.getMessageClass(joinMessage);
    expect(cssClass).toBe('system');
  });

  /**
   * Test de la classe CSS pour les messages système (LEAVE)
   * Vérifie que les messages LEAVE ont la classe 'system'
   */
  it('devrait retourner la classe "system" pour les messages LEAVE', () => {
    // Créer un message LEAVE
    const leaveMessage: ChatMessage = {
      type: MessageType.LEAVE,
      sender: 'User1',
      senderRole: SenderRole.CLIENT,
      content: 'User1 a quitté le chat'
    };

    // Vérifier la classe
    const cssClass = component.getMessageClass(leaveMessage);
    expect(cssClass).toBe('system');
  });

  /**
   * Test de la classe CSS pour les messages de l'utilisateur actuel
   * Vérifie que les messages de l'utilisateur ont la classe 'own'
   */
  it('devrait retourner la classe "own" pour les messages de l\'utilisateur actuel', () => {
    // Créer un message de l'utilisateur actuel
    const ownMessage: ChatMessage = {
      type: MessageType.CHAT,
      sender: 'TestUser',
      senderRole: SenderRole.CLIENT,
      content: 'My message'
    };

    // Vérifier la classe
    const cssClass = component.getMessageClass(ownMessage);
    expect(cssClass).toBe('own');
  });

  /**
   * Test de la classe CSS pour les messages des clients
   * Vérifie que les messages d'autres clients ont la classe 'client'
   */
  it('devrait retourner la classe "client" pour les messages des autres clients', () => {
    // Créer un message d'un autre client
    const clientMessage: ChatMessage = {
      type: MessageType.CHAT,
      sender: 'OtherClient',
      senderRole: SenderRole.CLIENT,
      content: 'Client message'
    };

    // Vérifier la classe
    const cssClass = component.getMessageClass(clientMessage);
    expect(cssClass).toBe('client');
  });

  /**
   * Test de la classe CSS pour les messages du support
   * Vérifie que les messages du support ont la classe 'support'
   */
  it('devrait retourner la classe "support" pour les messages du support', () => {
    // Créer un message d'un agent support
    const supportMessage: ChatMessage = {
      type: MessageType.CHAT,
      sender: 'Agent007',
      senderRole: SenderRole.SUPPORT,
      content: 'How can I help?'
    };

    // Vérifier la classe
    const cssClass = component.getMessageClass(supportMessage);
    expect(cssClass).toBe('support');
  });

  /**
   * Test de la méthode disconnect
   * Vérifie que la déconnexion appelle le service et émet l'événement
   */
  it('devrait se déconnecter et émettre l\'événement disconnected', () => {
    // Espionner l'émission de l'événement
    jest.spyOn(component.disconnected, 'emit');

    // Appeler disconnect
    component.disconnect();

    // Vérifier que le service a été appelé
    expect(mockChatService.disconnect).toHaveBeenCalledWith('TestUser', SenderRole.CLIENT);

    // Vérifier que l'événement a été émis
    expect(component.disconnected.emit).toHaveBeenCalled();
  });

  /**
   * Test de nettoyage des souscriptions
   * Vérifie que ngOnDestroy nettoie correctement les souscriptions
   */
  it('devrait nettoyer les souscriptions lors de ngOnDestroy', () => {
    // Espionner la méthode unsubscribe
    const subscription = (component as any).subscriptions[0];
    jest.spyOn(subscription, 'unsubscribe');

    // Appeler ngOnDestroy
    component.ngOnDestroy();

    // Vérifier que unsubscribe a été appelé
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });

  /**
   * Test de mise à jour des messages en temps réel
   * Vérifie que l'ajout de messages met à jour l'affichage
   */
  it('devrait mettre à jour l\'affichage quand de nouveaux messages arrivent', () => {
    // État initial - aucun message
    expect(component.messages.length).toBe(0);

    // Ajouter un premier message
    const message1: ChatMessage = {
      type: MessageType.CHAT,
      sender: 'User1',
      senderRole: SenderRole.CLIENT,
      content: 'First message'
    };
    messagesSubject.next([message1]);

    // Vérifier la mise à jour
    expect(component.messages.length).toBe(1);
    expect(component.messages[0].content).toBe('First message');

    // Ajouter un deuxième message
    const message2: ChatMessage = {
      type: MessageType.CHAT,
      sender: 'User2',
      senderRole: SenderRole.SUPPORT,
      content: 'Second message'
    };
    messagesSubject.next([message1, message2]);

    // Vérifier la mise à jour
    expect(component.messages.length).toBe(2);
    expect(component.messages[1].content).toBe('Second message');
  });

  /**
   * Test d'envoi de message par un utilisateur support
   * Vérifie que les utilisateurs support peuvent envoyer des messages
   */
  it('devrait permettre à un utilisateur support d\'envoyer des messages', () => {
    // Définir l'utilisateur comme support
    component.currentUser = 'Agent007';
    component.currentRole = SenderRole.SUPPORT;
    component.messageContent = 'Support message';

    // Envoyer le message
    component.sendMessage();

    // Vérifier que le service a été appelé avec le bon rôle
    expect(mockChatService.sendMessage).toHaveBeenCalledWith(
      'Support message',
      'Agent007',
      SenderRole.SUPPORT
    );
  });

  /**
   * Test de gestion des messages avec timestamp
   * Vérifie que les timestamps sont correctement gérés
   */
  it('devrait gérer correctement les messages avec timestamp', () => {
    // Créer un message avec timestamp
    const timestamp = new Date('2025-10-10T10:00:00');
    const messageWithTimestamp: ChatMessage = {
      type: MessageType.CHAT,
      sender: 'User1',
      senderRole: SenderRole.CLIENT,
      content: 'Message with timestamp',
      timestamp: timestamp
    };

    // Émettre le message
    messagesSubject.next([messageWithTimestamp]);

    // Vérifier que le timestamp est préservé
    expect(component.messages[0].timestamp).toEqual(timestamp);
  });
});
