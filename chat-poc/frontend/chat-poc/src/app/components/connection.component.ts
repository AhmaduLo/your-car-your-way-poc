import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { SenderRole } from '../models/chat-message.model';

@Component({
  selector: 'app-connection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<div class="connection-container">

  <!-- En-tête -->
  <div class="connection-header">
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

  <!-- Message de connexion réussie -->
  <!-- <div class="connected-info" *ngIf="isConnected">
    <p>Vous êtes connecté en tant que <strong>{{ currentUser }}</strong> ({{ currentRole }})</p>
    <button (click)="disconnect()" class="btn-disconnect">
      Déconnexion
    </button>
  </div> -->

</div>`,
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent {

  // État de la connexion
  isConnected = false;
  isConnecting = false;

  // Formulaire de connexion
  username = '';
  selectedRole: SenderRole = SenderRole.CLIENT;

  // Utilisateur actuel
  currentUser = '';
  currentRole: SenderRole = SenderRole.CLIENT;

  // Enum pour le template
  SenderRole = SenderRole;

  // Événements
  @Output() connectionEstablished = new EventEmitter<{username: string, role: SenderRole}>();
  @Output() connectionClosed = new EventEmitter<void>();

  constructor(private readonly chatService: ChatService) {
    // S'abonner au statut de connexion
    this.chatService.connected$.subscribe(connected => {
      this.isConnected = connected;
      this.isConnecting = false;
      
      if (!connected) {
        this.connectionClosed.emit();
      }
    });
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
        this.connectionEstablished.emit({
          username: this.currentUser,
          role: this.currentRole
        });
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
    this.chatService.disconnect(this.currentUser, this.currentRole);
    this.username = '';
    this.currentUser = '';
    this.connectionClosed.emit();
  }
}
