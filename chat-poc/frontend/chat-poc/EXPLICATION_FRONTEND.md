# 📚 Explication détaillée du Frontend Angular

## Vue d'ensemble de l'architecture

```
Frontend Angular
│
├── Models (Modèles de données)
│   └── Définit la structure des messages
│
├── Services (Logique métier)
│   └── Gère la connexion WebSocket et les communications
│
└── Components (Interface utilisateur)
    └── Affiche le chat et gère les interactions utilisateur
```

---

## 1️⃣ MODELS - Les modèles de données

**Fichier :** `src/app/models/chat-message.model.ts`

**Rôle :** Définir la structure exacte d'un message de chat en TypeScript.

**Analogie :** C'est comme un formulaire vierge. Vous définissez quels champs existent (nom, contenu, date, etc.).

### Code expliqué

```typescript
/**
 * Types de messages possibles dans le chat
 *
 * JOIN  = Quelqu'un arrive dans le chat
 * LEAVE = Quelqu'un quitte le chat
 * CHAT  = Message normal de conversation
 */
export enum MessageType {
  JOIN = 'JOIN',
  LEAVE = 'LEAVE',
  CHAT = 'CHAT'
}

/**
 * Rôles des utilisateurs dans l'application
 *
 * CLIENT  = Client qui demande de l'aide
 * SUPPORT = Employé du service client
 */
export enum SenderRole {
  CLIENT = 'CLIENT',
  SUPPORT = 'SUPPORT'
}

/**
 * Interface définissant la structure d'un message
 *
 * C'est le "contrat" que chaque message doit respecter.
 * Les champs avec ? sont optionnels.
 */
export interface ChatMessage {
  id?: string;              // Identifiant unique (optionnel)
  type: MessageType;        // Type de message (obligatoire)
  sender: string;           // Nom de l'expéditeur (obligatoire)
  senderRole: SenderRole;   // Rôle de l'expéditeur (obligatoire)
  content: string;          // Contenu du message (obligatoire)
  timestamp?: Date;         // Date/heure d'envoi (optionnel)
}
```

### Pourquoi des interfaces ?

✅ **TypeScript vérifie** que vous n'oubliez pas de champs
✅ **Autocomplétion** dans VS Code
✅ **Détection d'erreurs** avant l'exécution

---

## 2️⃣ SERVICES - La logique de connexion

**Fichier :** `src/app/services/chat.service.ts`

**Rôle :** Gérer toute la communication WebSocket avec le backend.

**Analogie :** C'est le facteur qui livre et reçoit les lettres entre vous et le serveur.

### Imports et déclarations

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as SockJS from 'sockjs-client';
import { Stomp, CompatClient, IMessage } from '@stomp/stompjs';
```

**Explications :**

- `Injectable` : Permet à Angular d'injecter ce service partout
- `BehaviorSubject` : Flux de données observable (les composants peuvent s'abonner)
- `SockJS` : Client WebSocket avec compatibilité navigateurs
- `Stomp` : Protocole de messaging

### Variables principales

```typescript
export class ChatService {

  // Client STOMP pour gérer la connexion WebSocket
  // null au départ car pas encore connecté
  private stompClient: CompatClient | null = null;

  // BehaviorSubject = flux observable qui garde la dernière valeur
  // Les composants peuvent s'abonner pour recevoir les messages
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();

  // Flux pour le statut de connexion (connecté ou non)
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$: Observable<boolean> = this.connectedSubject.asObservable();

  // Tableau local pour stocker tous les messages
  private messages: ChatMessage[] = [];

  // URL de connexion au backend
  // IMPORTANT : Changez ceci si votre backend est ailleurs
  private readonly SOCKET_URL = 'http://localhost:8080/ws';
}
```

### Méthode `connect()`

```typescript
/**
 * Établir la connexion WebSocket avec le serveur
 *
 * @param username Nom de l'utilisateur qui se connecte
 * @param role Rôle de l'utilisateur (CLIENT ou SUPPORT)
 * @returns Une Promise qui se résout quand la connexion est établie
 */
connect(username: string, role: SenderRole): Promise<void> {
  return new Promise((resolve, reject) => {

    // Étape 1 : Créer une connexion SockJS
    // SockJS gère automatiquement les fallbacks si WebSocket ne marche pas
    const socket = new SockJS(this.SOCKET_URL);

    // Étape 2 : Créer le client STOMP par-dessus SockJS
    // STOMP structure les messages WebSocket
    this.stompClient = Stomp.over(socket);

    // Désactiver les logs de debug (optionnel)
    this.stompClient.debug = () => {};

    // Étape 3 : Se connecter au serveur
    this.stompClient.connect(
      {}, // Headers (vide pour l'instant)

      // Callback de succès
      (frame) => {
        console.log('✅ Connecté au serveur');

        // Mettre à jour le statut
        this.connectedSubject.next(true);

        // S'abonner au topic public pour recevoir TOUS les messages
        // Chaque fois qu'un message arrive sur /topic/public,
        // la méthode onMessageReceived() sera appelée
        this.stompClient!.subscribe('/topic/public', (message: IMessage) => {
          this.onMessageReceived(message);
        });

        // Envoyer un message JOIN pour annoncer l'arrivée
        this.sendJoinMessage(username, role);

        // Résoudre la Promise (connexion réussie)
        resolve();
      },

      // Callback d'erreur
      (error) => {
        console.error('❌ Erreur de connexion:', error);
        this.connectedSubject.next(false);
        reject(error);
      }
    );
  });
}
```

### Flux de connexion :

1. **Client crée SockJS** → Connexion HTTP
2. **Client crée STOMP** → Protocole de messaging
3. **Client se connecte** → Handshake avec le serveur
4. **Client s'abonne à `/topic/public`** → Prêt à recevoir
5. **Client envoie JOIN** → Annonce son arrivée

### Méthode `sendMessage()`

```typescript
/**
 * Envoyer un message de chat au serveur
 *
 * Le serveur le recevra et le diffusera à tous les clients connectés
 *
 * @param content Contenu du message
 * @param sender Nom de l'expéditeur
 * @param role Rôle de l'expéditeur
 */
sendMessage(content: string, sender: string, role: SenderRole): void {

  // Vérifier qu'on est bien connecté
  if (this.stompClient && this.stompClient.connected) {

    // Créer l'objet message
    const chatMessage: ChatMessage = {
      type: MessageType.CHAT,
      sender: sender,
      senderRole: role,
      content: content,
      timestamp: new Date()
    };

    // Envoyer vers le serveur
    // Destination : /app/chat.sendMessage (préfixe /app défini dans le backend)
    // Le serveur va traiter ce message et le diffuser à tous
    this.stompClient.send(
      '/app/chat.sendMessage',
      {}, // Headers (vide)
      JSON.stringify(chatMessage) // Convertir l'objet en JSON
    );
  }
}
```

### Méthode `onMessageReceived()`

```typescript
/**
 * Appelée automatiquement quand un message arrive du serveur
 *
 * Cette méthode est le callback de l'abonnement à /topic/public
 *
 * @param message Message brut reçu du serveur
 */
private onMessageReceived(message: IMessage): void {

  // Étape 1 : Parser le JSON reçu
  const chatMessage: ChatMessage = JSON.parse(message.body);

  // Étape 2 : Ajouter un timestamp si absent
  if (!chatMessage.timestamp) {
    chatMessage.timestamp = new Date();
  } else {
    // Convertir la string en objet Date
    chatMessage.timestamp = new Date(chatMessage.timestamp);
  }

  // Étape 3 : Ajouter le message à la liste locale
  this.messages.push(chatMessage);

  // Étape 4 : Notifier tous les abonnés qu'il y a de nouveaux messages
  // Le [...messages] crée une nouvelle copie du tableau pour déclencher la détection de changement
  this.messagesSubject.next([...this.messages]);

  console.log('📩 Message reçu:', chatMessage);
}
```

### Pourquoi BehaviorSubject ?

- Le composant peut s'abonner : `chatService.messages$.subscribe(...)`
- Quand un message arrive, tous les abonnés sont notifiés automatiquement
- **Programmation réactive** : pas besoin de raffraîchir manuellement

---

## 3️⃣ COMPONENT - L'interface utilisateur

**Fichier :** `src/app/components/chat.component.ts`

**Rôle :** Gérer l'interaction utilisateur et afficher les messages.

### Variables d'état

```typescript
export class ChatComponent implements OnInit, OnDestroy {

  // État de connexion (connecté ou non)
  isConnected = false;

  // Connexion en cours (afficher un spinner)
  isConnecting = false;

  // Liste des messages à afficher
  messages: ChatMessage[] = [];

  // Formulaire de connexion
  username = '';                              // Nom saisi par l'utilisateur
  selectedRole: SenderRole = SenderRole.CLIENT; // Rôle sélectionné

  // Formulaire de message
  messageContent = '';                        // Contenu du message en cours de saisie

  // Utilisateur actuel (une fois connecté)
  currentUser = '';
  currentRole: SenderRole = SenderRole.CLIENT;

  // Souscriptions RxJS (pour nettoyer à la destruction)
  private subscriptions: Subscription[] = [];

  // Rendre les enums disponibles dans le template HTML
  MessageType = MessageType;
  SenderRole = SenderRole;
}
```

### Cycle de vie Angular

```typescript
/**
 * Appelé automatiquement quand le composant est initialisé
 *
 * C'est ici qu'on s'abonne aux flux de données du service
 */
ngOnInit(): void {

  // S'abonner aux messages du service
  // Chaque fois que le service reçoit un nouveau message,
  // cette fonction est appelée avec la nouvelle liste
  this.subscriptions.push(
    this.chatService.messages$.subscribe(messages => {
      this.messages = messages;  // Mettre à jour la liste locale
      this.scrollToBottom();      // Scroller vers le bas
    })
  );

  // S'abonner au statut de connexion
  this.subscriptions.push(
    this.chatService.connected$.subscribe(connected => {
      this.isConnected = connected;
      this.isConnecting = false;
    })
  );
}

/**
 * Appelé automatiquement quand le composant est détruit
 *
 * Important pour éviter les fuites mémoire
 */
ngOnDestroy(): void {
  // Se déconnecter proprement
  this.disconnect();

  // Nettoyer toutes les souscriptions
  this.subscriptions.forEach(sub => sub.unsubscribe());
}
```

### Méthodes d'interaction

```typescript
/**
 * Se connecter au chat
 *
 * Appelée quand l'utilisateur clique sur "Se connecter"
 */
connect(): void {
  // Validation : nom obligatoire
  if (!this.username.trim()) {
    alert('Veuillez entrer votre nom');
    return;
  }

  // Afficher le loader
  this.isConnecting = true;

  // Sauvegarder les infos utilisateur
  this.currentUser = this.username.trim();
  this.currentRole = this.selectedRole;

  // Appeler le service pour se connecter
  this.chatService.connect(this.currentUser, this.currentRole)
    .then(() => {
      console.log('Connexion réussie');
      // Le statut sera mis à jour via l'Observable
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert('Impossible de se connecter. Vérifiez que le backend tourne.');
      this.isConnecting = false;
    });
}

/**
 * Envoyer un message
 *
 * Appelée quand l'utilisateur clique sur "Envoyer" ou appuie sur Entrée
 */
sendMessage(): void {
  // Ne rien faire si le message est vide
  if (!this.messageContent.trim()) {
    return;
  }

  // Appeler le service pour envoyer
  this.chatService.sendMessage(
    this.messageContent.trim(),
    this.currentUser,
    this.currentRole
  );

  // Vider le champ de saisie
  this.messageContent = '';
}
```

---

## 4️⃣ TEMPLATE HTML

### Structure du template

```html
<div class="chat-container">
  <!-- En-tête avec statut -->
  <!-- Formulaire de connexion (si pas connecté) -->
  <!-- Interface de chat (si connecté) -->
</div>
```

### Directives Angular utilisées

#### `*ngIf` : Affichage conditionnel

```html
<!-- Afficher seulement si PAS connecté -->
<div *ngIf="!isConnected">
  Formulaire de connexion
</div>

<!-- Afficher seulement si connecté -->
<div *ngIf="isConnected">
  Interface de chat
</div>
```

#### `*ngFor` : Boucle sur un tableau

```html
<!-- Pour chaque message dans la liste -->
<div *ngFor="let message of messages">
  {{ message.content }}
</div>
```

#### `[(ngModel)]` : Liaison bidirectionnelle

```html
<!-- Le champ input est lié à la variable username -->
<!-- Quand l'utilisateur tape, username est mis à jour automatiquement -->
<input [(ngModel)]="username">
```

#### `[ngClass]` : Classes CSS conditionnelles

```html
<!-- Ajoute la classe 'connected' si isConnected est true -->
<div [ngClass]="{'connected': isConnected}">
```

#### `(click)` : Gestionnaire d'événement

```html
<!-- Appelle la méthode connect() au clic -->
<button (click)="connect()">Se connecter</button>
```

---

## 5️⃣ STYLES SCSS

### Pourquoi SCSS plutôt que CSS ?

SCSS ajoute des fonctionnalités à CSS :

#### Variables

```scss
$primary-color: #667eea;
$secondary-color: #764ba2;

.button {
  background: $primary-color;
}
```

#### Nesting (imbrication)

```scss
.chat-container {
  width: 100%;

  .header {
    padding: 20px;

    h1 {
      font-size: 24px;
    }
  }
}
```

#### Mixins (fonctions réutilisables)

```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  @include flex-center;
}
```

#### Parent selector (&)

```scss
.button {
  background: blue;

  &:hover {
    background: darkblue;
  }

  &.disabled {
    opacity: 0.5;
  }
}
```

---

## 6️⃣ FLUX DE DONNÉES COMPLET

### Scénario : Envoyer un message

```
1. Utilisateur tape dans <input [(ngModel)]="messageContent">
   → La variable messageContent est mise à jour en temps réel

2. Utilisateur clique sur "Envoyer" ou appuie sur Entrée
   → Appelle sendMessage() dans le composant

3. Composant appelle chatService.sendMessage()
   → Service envoie le message via WebSocket

4. Backend reçoit le message
   → Diffuse à tous les clients connectés via /topic/public

5. Tous les clients (y compris nous) reçoivent le message
   → onMessageReceived() est appelé

6. Service met à jour messagesSubject.next()
   → Tous les abonnés sont notifiés

7. Composant reçoit la mise à jour via l'Observable
   → La vue HTML se met à jour automatiquement
```

### Diagramme de flux

```
┌─────────────────┐
│  User Interface │
│  (HTML Template)│
└────────┬────────┘
         │
         │ [(ngModel)], (click), *ngFor
         │
         ▼
┌─────────────────┐
│   Component     │
│  (.ts file)     │
└────────┬────────┘
         │
         │ Injection de dépendance
         │
         ▼
┌─────────────────┐
│    Service      │
│ (chat.service)  │
└────────┬────────┘
         │
         │ WebSocket (SockJS + STOMP)
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  (Spring Boot)  │
└─────────────────┘
```

---

## 7️⃣ CONCEPTS CLÉS À RETENIR

### Observables (RxJS)

- **BehaviorSubject** : Flux de données qui garde toujours la dernière valeur
- **Observable** : Flux de données en lecture seule
- **subscribe()** : S'abonner pour recevoir les mises à jour
- **unsubscribe()** : Se désabonner pour éviter les fuites mémoire

### Injection de dépendances

```typescript
constructor(private chatService: ChatService) {}
```

Angular crée automatiquement une instance du service et l'injecte.

### Cycle de vie des composants

1. **ngOnInit** : Initialisation (s'abonner aux observables)
2. **ngOnDestroy** : Destruction (se désabonner, nettoyer)

### Data binding

- **Interpolation** : `{{ variable }}`
- **Property binding** : `[property]="value"`
- **Event binding** : `(event)="handler()"`
- **Two-way binding** : `[(ngModel)]="variable"`

---

## 8️⃣ POINTS D'ATTENTION

### Sécurité

⚠️ **Ne jamais faire confiance aux données du client**
Le backend doit toujours valider les messages reçus.

### Performance

✅ Utiliser `trackBy` avec `*ngFor` pour les grandes listes
✅ Se désabonner des Observables dans `ngOnDestroy`
✅ Utiliser `ChangeDetectionStrategy.OnPush` si nécessaire

### Gestion d'erreurs

✅ Toujours gérer les cas d'erreur de connexion
✅ Afficher des messages clairs à l'utilisateur
✅ Logger les erreurs pour le debugging

---

## 9️⃣ AMÉLIORATIONS POSSIBLES

### 1. Gestion des reconnexions automatiques

```typescript
private reconnect(): void {
  setTimeout(() => {
    if (!this.stompClient?.connected) {
      this.connect(this.currentUser, this.currentRole);
    }
  }, 5000); // Réessayer après 5 secondes
}
```

### 2. Indicateur "en train d'écrire"

```typescript
sendTypingIndicator(): void {
  this.stompClient.send('/app/chat.typing', {}, this.currentUser);
}
```

### 3. Notifications de messages non lus

```typescript
private unreadCount = 0;

incrementUnread(): void {
  this.unreadCount++;
  document.title = `(${this.unreadCount}) Chat`;
}
```

### 4. Persistance des messages (LocalStorage)

```typescript
saveMessages(): void {
  localStorage.setItem('chat-messages', JSON.stringify(this.messages));
}

loadMessages(): void {
  const stored = localStorage.getItem('chat-messages');
  if (stored) {
    this.messages = JSON.parse(stored);
  }
}
```

---

## 🎓 CONCLUSION

Ce frontend Angular utilise :

✅ **Architecture en couches** : Models → Services → Components
✅ **Programmation réactive** : Observables RxJS
✅ **WebSocket temps réel** : SockJS + STOMP
✅ **TypeScript** : Typage fort pour la sécurité
✅ **SCSS** : Styles modulaires et maintenables

Le tout communique avec un backend Spring Boot via WebSocket pour créer une application de chat en temps réel professionnelle.