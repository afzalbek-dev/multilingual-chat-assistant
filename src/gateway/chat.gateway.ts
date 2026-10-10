import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { chatService } from '../modules/chat/chat.service.js';
import { databaseService } from '../database/database.service.js';
import { appConfig } from '../config/app.config.js';

interface ClientConnection {
  ws: WebSocket;
  sessionId: string;
  isAlive: boolean;
  language: string;
}

export class ChatGateway {
  private wss: WebSocketServer | null = null;
  private clients = new Map<WebSocket, ClientConnection>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      const conn: ClientConnection = {
        ws,
        sessionId: `sess-${Date.now()}`,
        isAlive: true,
        language: appConfig.defaultLanguage,
      };
      this.clients.set(ws, conn);

      ws.on('pong', () => {
        conn.isAlive = true;
      });

      ws.on('message', async (data: Buffer | string) => {
        try {
          const raw = data.toString();
          const parsed = JSON.parse(raw);
          await this.handleClientEvent(conn, parsed);
        } catch (err) {
          this.sendEvent(ws, 'error', { message: 'Invalid payload format or parsing error.' });
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      // Greet newly connected client
      this.sendEvent(ws, 'connected', {
        sessionId: conn.sessionId,
        defaultLanguage: conn.language,
        message: 'Connected to Multilingual Chat Assistant WebSocket Gateway.',
      });
    });

    // Setup heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      for (const [ws, conn] of this.clients.entries()) {
        if (!conn.isAlive) {
          ws.terminate();
          this.clients.delete(ws);
          continue;
        }
        conn.isAlive = false;
        ws.ping();
      }
    }, appConfig.wsHeartbeatIntervalMs);
    this.heartbeatInterval.unref();
  }

  private async handleClientEvent(conn: ClientConnection, event: { type: string; payload: any }): Promise<void> {
    const { type, payload } = event;
    const ws = conn.ws;

    switch (type) {
      case 'session:join': {
        if (payload?.sessionId) {
          conn.sessionId = payload.sessionId;
        }
        if (payload?.language) {
          conn.language = payload.language;
        }
        const existing = await databaseService.getSession(conn.sessionId);
        if (!existing) {
          await databaseService.createSession(conn.sessionId, 'New Conversation', 'ws-user', conn.language);
        }
        const history = await databaseService.getMessages(conn.sessionId);
        this.sendEvent(ws, 'session:ready', {
          sessionId: conn.sessionId,
          language: conn.language,
          historyCount: history.length,
          messages: history.slice(-10),
        });
        break;
      }

      case 'language:set': {
        if (payload?.language) {
          conn.language = payload.language;
          this.sendEvent(ws, 'language:updated', { language: conn.language });
        }
        break;
      }

      case 'chat:typing': {
        // Broadcast typing to any peers in same session
        this.broadcastToSession(conn.sessionId, ws, 'chat:typing', {
          sessionId: conn.sessionId,
          isTyping: !!payload?.isTyping,
        });
        break;
      }

      case 'chat:message': {
        const text = payload?.text?.trim();
        if (!text) {
          this.sendEvent(ws, 'error', { message: 'Message text cannot be empty.' });
          return;
        }

        const forcedLang = payload?.language || conn.language;
        // Process response via ChatService
        const response = await chatService.processUserMessage(conn.sessionId, text, forcedLang);

        // Simulate streaming chunks for realistic realtime experience
        const words = response.replyText.split(' ');
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(' ') + ' ';
          this.sendEvent(ws, 'chat:chunk', {
            messageId: response.messageId,
            chunk,
            isLast: i + 3 >= words.length,
          });
        }

        // Emit final response event
        this.sendEvent(ws, 'chat:response', response);
        break;
      }

      case 'feedback:submit': {
        if (payload?.messageId && payload?.rating) {
          await databaseService.saveFeedback({
            id: `fb-${Date.now()}`,
            message_id: payload.messageId,
            rating: payload.rating,
            comments: payload.comments,
            created_at: new Date().toISOString(),
          });
          this.sendEvent(ws, 'feedback:recorded', { status: 'success' });
        }
        break;
      }

      default:
        this.sendEvent(ws, 'warning', { message: `Unknown event type: ${type}` });
    }
  }

  private sendEvent(ws: WebSocket, type: string, payload: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload, timestamp: new Date().toISOString() }));
    }
  }

  private broadcastToSession(sessionId: string, senderWs: WebSocket, type: string, payload: any): void {
    for (const [ws, conn] of this.clients.entries()) {
      if (conn.sessionId === sessionId && ws !== senderWs && ws.readyState === WebSocket.OPEN) {
        this.sendEvent(ws, type, payload);
      }
    }
  }

  getActiveConnectionsCount(): number {
    return this.clients.size;
  }

  close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.wss) {
      this.wss.close();
    }
  }
}

export const chatGateway = new ChatGateway();
