import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConnectionComponent } from './connection.component';
import { ChatService } from '../services/chat.service';
import { SenderRole } from '../models/chat-message.model';
import { BehaviorSubject } from 'rxjs';

/**
 * Suite de tests pour le composant ConnectionComponent
 * Ce composant gère l'interface de connexion au chat
 */
describe('ConnectionComponent', () => {
  let component: ConnectionComponent;
  let fixture: ComponentFixture<ConnectionComponent>;
  let mockChatService: any;
  let connectedSubject: BehaviorSubject<boolean>;

  // Configuration avant chaque test
  beforeEach(async () => {
    // Créer un subject pour simuler l'observable de connexion
    connectedSubject = new BehaviorSubject<boolean>(false);

    // Créer un mock du service ChatService
    mockChatService = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      connected$: connectedSubject.asObservable()
    };

    // Configurer le module de test
    await TestBed.configureTestingModule({
      imports: [ConnectionComponent],
      providers: [
        { provide: ChatService, useValue: mockChatService }
      ]
    }).compileComponents();

    // Créer le composant et obtenir les références
    fixture = TestBed.createComponent(ConnectionComponent);
    component = fixture.componentInstance;
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
   * Test de l'état initial de connexion
   * Vérifie que le composant démarre en état déconnecté
   */
  it('devrait être déconnecté au départ', () => {
    expect(component.isConnected).toBe(false);
    expect(component.isConnecting).toBe(false);
  });

  /**
   * Test de l'initialisation du formulaire
   * Vérifie que les champs du formulaire sont initialisés correctement
   */
  it('devrait initialiser le formulaire avec des valeurs par défaut', () => {
    // Vérifier les valeurs initiales du formulaire
    expect(component.username).toBe('');
    expect(component.selectedRole).toBe(SenderRole.CLIENT);
    expect(component.currentUser).toBe('');
    expect(component.currentRole).toBe(SenderRole.CLIENT);
  });

  /**
   * Test de l'exposition de l'enum SenderRole
   * Vérifie que l'enum est disponible pour le template
   */
  it('devrait exposer l\'enum SenderRole au template', () => {
    expect(component.SenderRole).toBe(SenderRole);
    expect(component.SenderRole.CLIENT).toBe('CLIENT');
    expect(component.SenderRole.SUPPORT).toBe('SUPPORT');
  });

  /**
   * Test de connexion avec un nom d'utilisateur vide
   * Vérifie que la connexion est bloquée si le nom est vide
   */
  it('ne devrait pas permettre la connexion avec un nom vide', () => {
    // Définir un nom vide
    component.username = '';

    // Espionner la fonction alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Tenter de se connecter
    component.connect();

    // Vérifier que l'alerte a été affichée
    expect(window.alert).toHaveBeenCalledWith('Veuillez entrer votre nom');

    // Vérifier que le service n'a pas été appelé
    expect(mockChatService.connect).not.toHaveBeenCalled();
  });

  /**
   * Test de connexion avec un nom contenant uniquement des espaces
   * Vérifie que les espaces seuls ne sont pas acceptés
   */
  it('ne devrait pas permettre la connexion avec seulement des espaces', () => {
    // Définir un nom avec uniquement des espaces
    component.username = '   ';

    // Espionner la fonction alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Tenter de se connecter
    component.connect();

    // Vérifier que l'alerte a été affichée
    expect(window.alert).toHaveBeenCalledWith('Veuillez entrer votre nom');

    // Vérifier que le service n'a pas été appelé
    expect(mockChatService.connect).not.toHaveBeenCalled();
  });

  /**
   * Test de connexion réussie
   * Vérifie que la connexion fonctionne avec des informations valides
   */
  it('devrait se connecter avec succès avec un nom valide', async () => {
    // Configurer le mock pour simuler une connexion réussie
    mockChatService.connect.mockReturnValue(Promise.resolve());

    // Définir un nom d'utilisateur valide
    component.username = 'TestUser';
    component.selectedRole = SenderRole.CLIENT;

    // Espionner l'émission de l'événement
    jest.spyOn(component.connectionEstablished, 'emit');

    // Appeler la méthode connect
    component.connect();

    // Vérifier que l'état de connexion en cours est activé
    expect(component.isConnecting).toBe(true);

    // Vérifier que le service a été appelé avec les bons paramètres
    expect(mockChatService.connect).toHaveBeenCalledWith('TestUser', SenderRole.CLIENT);

    // Attendre la résolution de la promesse
    await mockChatService.connect('TestUser', SenderRole.CLIENT);

    // Vérifier que l'événement a été émis
    expect(component.connectionEstablished.emit).toHaveBeenCalledWith({
      username: 'TestUser',
      role: SenderRole.CLIENT
    });
  });

  /**
   * Test de connexion avec le rôle SUPPORT
   * Vérifie que la connexion fonctionne pour un utilisateur support
   */
  it('devrait se connecter en tant que SUPPORT', async () => {
    // Configurer le mock
    mockChatService.connect.mockReturnValue(Promise.resolve());

    // Définir les informations d'un utilisateur support
    component.username = 'SupportAgent';
    component.selectedRole = SenderRole.SUPPORT;

    // Appeler la méthode connect
    component.connect();

    // Vérifier que le service a été appelé avec le rôle SUPPORT
    expect(mockChatService.connect).toHaveBeenCalledWith('SupportAgent', SenderRole.SUPPORT);
  });

  /**
   * Test de gestion des erreurs de connexion
   * Vérifie que les erreurs sont correctement gérées
   */
  it('devrait gérer les erreurs de connexion', async () => {
    // Configurer le mock pour simuler une erreur
    const error = new Error('Connection failed');
    mockChatService.connect.mockReturnValue(Promise.reject(error));

    // Espionner les fonctions console et alert
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Définir un nom d'utilisateur
    component.username = 'TestUser';

    // Appeler la méthode connect
    component.connect();

    // Attendre la résolution de la promesse
    try {
      await mockChatService.connect('TestUser', SenderRole.CLIENT);
    } catch (e) {
      // L'erreur est attendue
    }

    // Attendre que toutes les promesses soient résolues
    await fixture.whenStable();

    // Vérifier que l'erreur a été loggée
    expect(console.error).toHaveBeenCalled();

    // Vérifier que l'alerte a été affichée
    expect(window.alert).toHaveBeenCalledWith(
      'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.'
    );

    // Vérifier que isConnecting est réinitialisé
    expect(component.isConnecting).toBe(false);
  });

  /**
   * Test de mise à jour de l'état de connexion via l'observable
   * Vérifie que le composant réagit aux changements du service
   */
  it('devrait mettre à jour isConnected quand connected$ émet', () => {
    // Vérifier l'état initial
    expect(component.isConnected).toBe(false);

    // Émettre un changement de connexion
    connectedSubject.next(true);

    // Vérifier que le composant a mis à jour son état
    expect(component.isConnected).toBe(true);
    expect(component.isConnecting).toBe(false);

    // Émettre une déconnexion
    connectedSubject.next(false);

    // Vérifier que le composant a mis à jour son état
    expect(component.isConnected).toBe(false);
  });

  /**
   * Test d'émission de l'événement de déconnexion
   * Vérifie que l'événement est émis quand connected$ devient false
   */
  it('devrait émettre connectionClosed quand connected$ devient false', () => {
    // Espionner l'émission de l'événement
    jest.spyOn(component.connectionClosed, 'emit');

    // Simuler une déconnexion
    connectedSubject.next(false);

    // Vérifier que l'événement a été émis
    expect(component.connectionClosed.emit).toHaveBeenCalled();
  });

  /**
   * Test de la méthode disconnect
   * Vérifie que la déconnexion appelle le service et réinitialise l'état
   */
  it('devrait se déconnecter correctement', () => {
    // Définir un utilisateur connecté
    component.currentUser = 'TestUser';
    component.currentRole = SenderRole.CLIENT;
    component.username = 'TestUser';

    // Espionner l'émission de l'événement
    jest.spyOn(component.connectionClosed, 'emit');

    // Appeler disconnect
    component.disconnect();

    // Vérifier que le service a été appelé
    expect(mockChatService.disconnect).toHaveBeenCalledWith('TestUser', SenderRole.CLIENT);

    // Vérifier que les champs sont réinitialisés
    expect(component.username).toBe('');
    expect(component.currentUser).toBe('');

    // Vérifier que l'événement a été émis
    expect(component.connectionClosed.emit).toHaveBeenCalled();
  });

  /**
   * Test de la suppression des espaces autour du nom
   * Vérifie que le nom d'utilisateur est nettoyé (trim)
   */
  it('devrait supprimer les espaces autour du nom d\'utilisateur', async () => {
    // Configurer le mock
    mockChatService.connect.mockReturnValue(Promise.resolve());

    // Définir un nom avec des espaces
    component.username = '  TestUser  ';

    // Appeler connect
    component.connect();

    // Vérifier que le nom a été nettoyé
    expect(component.currentUser).toBe('TestUser');
    expect(mockChatService.connect).toHaveBeenCalledWith('TestUser', SenderRole.CLIENT);
  });

  /**
   * Test de la sauvegarde du rôle sélectionné
   * Vérifie que le rôle sélectionné est sauvegardé comme rôle actuel
   */
  it('devrait sauvegarder le rôle sélectionné lors de la connexion', async () => {
    // Configurer le mock
    mockChatService.connect.mockReturnValue(Promise.resolve());

    // Définir un nom et un rôle
    component.username = 'Agent007';
    component.selectedRole = SenderRole.SUPPORT;

    // Appeler connect
    component.connect();

    // Vérifier que le rôle actuel correspond au rôle sélectionné
    expect(component.currentRole).toBe(SenderRole.SUPPORT);
  });
});
