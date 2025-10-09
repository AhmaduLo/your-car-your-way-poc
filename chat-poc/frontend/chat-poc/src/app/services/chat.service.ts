import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { CompatClient, Stomp, IMessage } from "@stomp/stompjs";
import {
    ChatMessage,
    MessageType,
    SenderRole,
} from "../models/chat-message.model";
import SockJS from "sockjs-client";
/**
 * Service gérant la connexion WebSocket et les messages du chat
 */
@Injectable({
    providedIn: "root",
})
export class ChatService {
    // Client STOMP pour WebSocket
    private stompClient: CompatClient | null = null;

    // Observable pour les messages reçus
    private readonly messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
    public messages$: Observable<
        ChatMessage[]
    > = this.messagesSubject.asObservable();



    // Observable pour le statut de connexion
    private readonly connectedSubject = new BehaviorSubject<boolean>(false);
    public connected$: Observable<boolean> = this.connectedSubject.asObservable();

    // Stockage local des messages
    private readonly messages: ChatMessage[] = [];

    // URL du backend
    private readonly SOCKET_URL = "http://localhost:8080/ws";


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
                    console.log("✅ Connecté au serveur WebSocket");
                    this.connectedSubject.next(true);

                    // S'abonner au topic public pour recevoir les messages
                    this.stompClient!.subscribe("/topic/public", (message: IMessage) => {
                        this.onMessageReceived(message);
                    });

                    // Envoyer le message JOIN pour annoncer l'arrivée
                    this.sendJoinMessage(username, role);

                    resolve();
                },
                (error: Error) => {
                    console.error("❌ Erreur de connexion WebSocket:", error);
                    this.connectedSubject.next(false);
                    reject(error);
                }
            );
        });
    }

    /**
     * Se déconnecter du serveur
     */
    disconnect(username: string, role: SenderRole): void {
        if (this.stompClient && this.stompClient.connected) {
            // Envoyer le message LEAVE avant de se déconnecter
            this.sendLeaveMessage(username, role);

            // Attendre un peu pour que le message soit envoyé avant de se déconnecter
            setTimeout(() => {
                this.stompClient!.disconnect(() => {
                    console.log("Déconnecté du serveur");
                    this.connectedSubject.next(false);
                    //this.messages = [];
                    this.messagesSubject.next([...this.messages]);
                });
            }, 100);
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
            content: `${username} a rejoint le chat en tant que ${role}`,
        };

        this.stompClient!.send(
            "/app/chat.addUser",
            {},
            JSON.stringify(joinMessage)
        );
    }

    private sendLeaveMessage(username: string, role: SenderRole): void {
        const leaveMessage: ChatMessage = {
            type: MessageType.LEAVE,
            sender: username,
            senderRole: role,
            content: `${username} a quitté le chat.`,
        };

        this.stompClient!.send(
            "/app/chat.addUser",
            {},
            JSON.stringify(leaveMessage)
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
                timestamp: new Date(),
            };

            this.stompClient.send(
                "/app/chat.sendMessage",
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
    }

    /**
     * Vérifier si connecté
     */
    isConnected(): boolean {
        return this.stompClient !== null && this.stompClient.connected;
    }
}
