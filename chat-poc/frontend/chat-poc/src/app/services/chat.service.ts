import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CompatClient, Stomp, IMessage } from '@stomp/stompjs';
import { ChatMessage, MessageType, SenderRole } from '../models/chat-message.model';
import SockJS from 'sockjs-client';
/**
 * Service gérant la connexion WebSocket et les messages du chat
 */
@Injectable({
    providedIn: 'root'
})
export class ChatService {

    // Client STOMP pour WebSocket
    private stompClient: CompatClient | null = null;

    // Observable pour les messages reçus
    private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
    public messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();

    // Observable pour le statut de connexion
    private connectedSubject = new BehaviorSubject<boolean>(false);
    public connected$: Observable<boolean> = this.connectedSubject.asObservable();

    // Stockage local des messages
    private messages: ChatMessage[] = [];

    // URL du backend
    private readonly SOCKET_URL = 'http://localhost:8080/ws';

    constructor() { }

    /**
   * Se connecter au serveur WebSocket
   * @param username Nom d'utilisateur
   * @param role Rôle (CLIENT ou SUPPORT)
   */

    connect(username: string, role: SenderRole): Promise<void> {
        return new Promise((resolve, reject) => {

            // Créer la connexion SockJS
            const socket = new SockJS(this.SOCKET_URL);

            // Créer le client STOMP
            this.stompClient = Stomp.over(socket);

            // Désactiver les logs de debug (optionnel)
            this.stompClient.debug = () => { };

            // Se connecter
            interface StompFrame {
                headers: Record<string, string>;
                body: string;
                command: string;
            }

            interface StompConnectionOptions {
                // Empty object for this case, but could be extended with options
            }

            this.stompClient.connect(
                {} as StompConnectionOptions,
                (frame: StompFrame) => {
                    console.log('✅ Connecté au serveur WebSocket');
                    this.connectedSubject.next(true);

                    // S'abonner au topic public pour recevoir les messages
                    this.stompClient!.subscribe('/topic/public', (message: IMessage) => {
                        this.onMessageReceived(message);
                    });

                    // Envoyer le message JOIN pour annoncer l'arrivée
                    this.sendJoinMessage(username, role);

                    resolve();
                },
                (error: Error) => {
                    console.error('❌ Erreur de connexion WebSocket:', error);
                    this.connectedSubject.next(false);
                    reject(error);
                }
            );
        });
    }

    /**
    * Se déconnecter du serveur
    */
    disconnect(): void {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.disconnect(() => {
                console.log('🔌 Déconnecté du serveur');
                this.connectedSubject.next(false);
                this.messages = [];
                this.messagesSubject.next([]);
            });
        }
    }

    /**
    * Envoyer un message JOIN au serveur
    */
    private sendJoinMessage(username: string, role: SenderRole): void {
        const joinMessage: ChatMessage = {
            type: MessageType.JOIN,
            sender: username,
            senderRole: role,
            content: `${username} a rejoint le chat`
        };

        this.stompClient!.send(
            '/app/chat.addUser',
            {},
            JSON.stringify(joinMessage)
        );
    }

    /**
   * Envoyer un message de chat
   * @param content Contenu du message
   * @param sender Nom de l'expéditeur
   * @param role Rôle de l'expéditeur
   */
    sendMessage(content: string, sender: string, role: SenderRole): void {
        if (this.stompClient && this.stompClient.connected) {
            const chatMessage: ChatMessage = {
                type: MessageType.CHAT,
                sender: sender,
                senderRole: role,
                content: content,
                timestamp: new Date()
            };

            this.stompClient.send(
                '/app/chat.sendMessage',
                {},
                JSON.stringify(chatMessage)
            );
        }
    }


    /**
     * Callback appelé quand un message est reçu
     */
    private onMessageReceived(message: IMessage): void {
        const chatMessage: ChatMessage = JSON.parse(message.body);

        // Ajouter le timestamp si absent
        if (!chatMessage.timestamp) {
            chatMessage.timestamp = new Date();
        } else {
            chatMessage.timestamp = new Date(chatMessage.timestamp);
        }

        // Ajouter le message à la liste
        this.messages.push(chatMessage);
        this.messagesSubject.next([...this.messages]);

        console.log('📩 Message reçu:', chatMessage);
    }

    /**
     * Vérifier si connecté
     */
    isConnected(): boolean {
        return this.stompClient !== null && this.stompClient.connected;
    }
}
