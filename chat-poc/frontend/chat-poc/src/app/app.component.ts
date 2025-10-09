import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectionComponent } from './components/connection.component';
import { ChatComponent } from './components/chat.component';
import { SenderRole } from './models/chat-message.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ConnectionComponent, ChatComponent],
  template: `
    <div class="app-container">
      <app-connection
        *ngIf="!isConnected"
        (connectionEstablished)="onConnectionEstablished($event)">
      </app-connection>

      <app-chat
        *ngIf="isConnected"
        [currentUser]="currentUser"
        [currentRole]="currentRole"
        (disconnected)="onDisconnected()">
      </app-chat>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      background-attachment: fixed;
      position: relative;
      overflow: hidden;
    }

    .app-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    app-connection {
      position: relative;
      z-index: 1;
    }

    app-chat {
      display: block;
      height: 100vh;
      position: relative;
      z-index: 1;
    }
  `]
})
export class AppComponent {
  isConnected = false;
  currentUser = '';
  currentRole: SenderRole = SenderRole.CLIENT;

  onConnectionEstablished(data: {username: string, role: SenderRole}): void {
    this.isConnected = true;
    this.currentUser = data.username;
    this.currentRole = data.role;
  }

  onDisconnected(): void {
    this.isConnected = false;
    this.currentUser = '';
    this.currentRole = SenderRole.CLIENT;
  }
}
