import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { databaseService } from '../database/database.service.js';
import { chatService } from '../modules/chat/chat.service.js';
import { knowledgeService } from '../modules/rag/knowledge.service.js';
import { chatGateway } from '../gateway/chat.gateway.js';
import { appConfig } from '../config/app.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../../public');

export function createHttpServer(): http.Server {
  return http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // Helper for sending JSON
    const sendJson = (statusCode: number, data: any) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    // Helper for reading JSON body
    const readBody = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch (e) {
            reject(e);
          }
        });
        req.on('error', reject);
      });
    };

    try {
      // 1. Health check
      if (req.method === 'GET' && pathname === '/health') {
        const analytics = await databaseService.getAnalytics();
        return sendJson(200, {
          status: 'healthy',
          app: 'multilingual-chat-assistant',
          version: '1.0.0',
          activeWebSocketConnections: chatGateway.getActiveConnectionsCount(),
          database: analytics.is_postgres_active ? 'postgresql' : 'in-memory-fallback',
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Analytics overview
      if (req.method === 'GET' && pathname === '/api/v1/analytics') {
        const stats = await databaseService.getAnalytics();
        return sendJson(200, stats);
      }

      // 3. List sessions
      if (req.method === 'GET' && pathname === '/api/v1/sessions') {
        const sessions = await databaseService.listSessions();
        return sendJson(200, { total: sessions.length, sessions });
      }

      // 4. Session messages history: /api/v1/sessions/:id/messages
      if (req.method === 'GET' && pathname.startsWith('/api/v1/sessions/') && pathname.endsWith('/messages')) {
        const parts = pathname.split('/');
        const sessionId = parts[4];
        const messages = await databaseService.getMessages(sessionId);
        return sendJson(200, { sessionId, total: messages.length, messages });
      }

      // 5. REST Chat endpoint: POST /api/v1/chat
      if (req.method === 'POST' && pathname === '/api/v1/chat') {
        const body = await readBody();
        const sessionId = body.sessionId || `rest-sess-${Date.now()}`;
        const message = (body.message || '').trim();

        if (!message) {
          return sendJson(400, { error: 'Message cannot be empty.' });
        }

        const response = await chatService.processUserMessage(sessionId, message, body.language);
        return sendJson(200, response);
      }

      // 6. Knowledge endpoints
      if (pathname === '/api/v1/knowledge') {
        if (req.method === 'GET') {
          const query = url.searchParams.get('q');
          const lang = url.searchParams.get('lang') || undefined;
          if (query) {
            const matches = await knowledgeService.search(query, lang);
            return sendJson(200, { query, results: matches });
          }
          const all = await knowledgeService.getAll();
          return sendJson(200, { total: all.length, documents: all });
        }

        if (req.method === 'POST') {
          const body = await readBody();
          if (!body.title || !body.content) {
            return sendJson(400, { error: 'Title and content are required.' });
          }
          const docId = `doc-${Date.now()}`;
          const newDoc = {
            id: docId,
            title: body.title,
            content: body.content,
            language: body.language || 'en',
            category: body.category || 'general',
            tags: body.tags || [],
            created_at: new Date().toISOString(),
          };
          await knowledgeService.addDocument(newDoc);
          return sendJson(201, { message: 'Document added', document: newDoc });
        }
      }

      // 7. Static Web UI (Index.html)
      if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
        const filePath = path.join(publicDir, 'index.html');
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('Multilingual Chat Assistant Server Running. Web UI not found.');
      }

      // 404 handler
      return sendJson(404, { error: 'Route not found' });
    } catch (err: any) {
      return sendJson(500, { error: 'Internal Server Error', details: err?.message });
    }
  });
}
