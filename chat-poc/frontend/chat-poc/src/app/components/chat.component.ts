
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { ChatMessage, MessageType, SenderRole } from '../models/chat-message.model';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<div class="chat-container">
  
  <!-- En-tête -->
  <div class="chat-header">
    <h1>🚗 Your Car Your Way - Chat Service Client</h1>
    <div class="status" [ngClass]="{'connected': isConnected, 'disconnected': !isConnected}">
      {{ isConnected ? '✅ Connecté' : '❌ Déconnecté' }}
    </div>
  </div>
  
  <!-- Formulaire de connexion -->
  <div class="login-form" *ngIf="!isConnected">
    <h2>Connexion au chat</h2>
    <div class="form-group">
      <label for="username">Votre nom :</label>
      <input 
        type="text" 
        id="username" 
        [(ngModel)]="username" 
        placeholder="Entrez votre nom..."
        (keypress.enter)="connect()"
        [disabled]="isConnecting">
    </div>
    
    <div class="form-group">
      <label for="role">Vous êtes :</label>
      <select id="role" [(ngModel)]="selectedRole" [disabled]="isConnecting">
        <option [value]="SenderRole.CLIENT">Client</option>
        <option [value]="SenderRole.SUPPORT">Support</option>
      </select>
    </div>
    
    <button 
      (click)="connect()" 
      [disabled]="isConnecting || !username.trim()"
      class="btn-primary">
      {{ isConnecting ? 'Connexion...' : 'Se connecter' }}
    </button>
  </div>
  
  <!-- Interface de chat -->
  <div class="chat-interface" *ngIf="isConnected">
    
    <!-- Zone des messages -->
    <div class="messages-container">
      <div 
        *ngFor="let message of messages" 
        class="message"
        [ngClass]="getMessageClass(message)">
        
        <!-- Message système (JOIN/LEAVE) -->
        <div *ngIf="message.type === MessageType.JOIN || message.type === MessageType.LEAVE" 
             class="message-system">
          {{ message.content }}
        </div>
        
        <!-- Message de chat normal -->
        <div *ngIf="message.type === MessageType.CHAT" class="message-bubble">
          <div class="message-sender">
            {{ message.sender }}
            <span class="message-role">({{ message.senderRole }})</span>
          </div>
          <div class="message-content">{{ message.content }}</div>
          <div class="message-timestamp">
            {{ message.timestamp | date:'HH:mm' }}
          </div>
        </div>
      </div>
      
      <!-- Message de bienvenue si aucun message -->
      <div *ngIf="messages.length === 0" class="welcome-message">
        <p>Bienvenue {{ currentUser }} !</p>
        <p>Vous êtes connecté en tant que {{ currentRole }}.</p>
        <p>Commencez la conversation...</p>
      </div>
    </div>
    
    <!-- Zone de saisie -->
    <div class="input-area">
      <div class="input-group">
        <input 
          type="text" 
          [(ngModel)]="messageContent" 
          placeholder="Tapez votre message..."
          (keypress)="onKeyPress($event)"
          class="message-input">
        <button 
          (click)="sendMessage()" 
          [disabled]="!messageContent.trim()"
          class="btn-send">
          Envoyer
        </button>
      </div>
      <button (click)="disconnect()" class="btn-disconnect">
        Déconnexion
      </button>
    </div>
  </div>
  
</div>`,
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  // État de la connexion
  isConnected = false;

  // État de connexion en cours
  isConnecting = false;

  // Messages du chat
  messages: ChatMessage[] = [];

  // Formulaire de connexion
  username = '';
  selectedRole: SenderRole = SenderRole.CLIENT;

  // Formulaire de message
  messageContent = '';

  // Utilisateur actuel
  currentUser = '';
  currentRole: SenderRole = SenderRole.CLIENT;

  // Souscriptions
  private subscriptions: Subscription[] = [];

  // Enum pour le template
  MessageType = MessageType;
  SenderRole = SenderRole;

  constructor(private readonly chatService: ChatService) { }

  ngOnInit(): void {
    // S'abonner aux messages
    this.subscriptions.push(
      this.chatService.messages$.subscribe(messages => {
        this.messages = messages;
        this.scrollToBottom();
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

  ngOnDestroy(): void {
    // Se déconnecter proprement
    this.disconnect();

    // Nettoyer les souscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Se connecter au chat
   */
  connect(): void {
    if (!this.username.trim()) {
      alert('Veuillez entrer votre nom');
      return;
    }

    this.isConnecting = true;
    this.currentUser = this.username.trim();
    this.currentRole = this.selectedRole;

    this.chatService.connect(this.currentUser, this.currentRole)
      .then(() => {
        console.log('Connexion réussie');
      })
      .catch(error => {
        console.error('Erreur de connexion:', error);
        alert('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
        this.isConnecting = false;
      });
  }

  /**
   * Se déconnecter du chat
   */
  disconnect(): void {
    this.chatService.disconnect();
    this.username = '';
    this.currentUser = '';
    this.messages = [];
  }

  /**
   * Envoyer un message
   */
  sendMessage(): void {
    if (!this.messageContent.trim()) {
      return;
    }

    this.chatService.sendMessage(
      this.messageContent.trim(),
      this.currentUser,
      this.currentRole
    );

    this.messageContent = '';
  }

  /**
   * Gérer la touche Entrée
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Vérifier si un message est de l'utilisateur actuel
   */
  isOwnMessage(message: ChatMessage): boolean {
    return message.sender === this.currentUser;
  }

  /**
   * Obtenir la classe CSS selon le type de message
   */
  getMessageClass(message: ChatMessage): string {
    if (message.type === MessageType.JOIN || message.type === MessageType.LEAVE) {
      return 'system';
    }

    if (this.isOwnMessage(message)) {
      return 'own';
    }

    return message.senderRole === SenderRole.CLIENT ? 'client' : 'support';
  }

  /**
   * Faire défiler vers le bas
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }
}