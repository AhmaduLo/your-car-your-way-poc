
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { ChatMessage, MessageType, SenderRole } from '../models/chat-message.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<div class="chat-container" *ngIf="currentUser">

  <!-- En-tête -->
  <div class="chat-header">
    <h2>💬 Messagerie</h2>
    <div class="header-actions">
      <div class="user-info">
        <span>{{ currentUser }} ({{ currentRole }})</span>
      </div>
      <button (click)="disconnect()" class="btn-disconnect">
        Déconnexion
      </button>
    </div>
  </div>

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
  </div>

</div>`,
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  // Messages du chat
  messages: ChatMessage[] = [];

  // Formulaire de message
  messageContent = '';

  // Utilisateur actuel
  @Input() currentUser = '';
  @Input() currentRole: SenderRole = SenderRole.CLIENT;

  // Événement de déconnexion
  @Output() disconnected = new EventEmitter<void>();

  // Souscriptions
  private readonly subscriptions: Subscription[] = [];

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
  }

  ngOnDestroy(): void {
    // Nettoyer les souscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
   * Se déconnecter du chat
   */
  disconnect(): void {
    this.chatService.disconnect(this.currentUser, this.currentRole);
    this.disconnected.emit();
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