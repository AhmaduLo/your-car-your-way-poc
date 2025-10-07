/**
 * Types de messages possibles
 */
export enum MessageType {
  JOIN = 'JOIN',
  LEAVE = 'LEAVE',
  CHAT = 'CHAT'
}

/**
 * Rôles des utilisateurs
 */
export enum SenderRole {
  CLIENT = 'CLIENT',
  SUPPORT = 'SUPPORT'
}

/**
 * Modèle représentant un message de chat
 */
export interface ChatMessage {
  id?: string;
  type: MessageType;
  sender: string;
  senderRole: SenderRole;
  content: string;
  timestamp?: Date;
}