import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { WebSocket } from 'ws';
import { createHttpServer } from '../http/http.server.js';
import { chatGateway } from '../gateway/chat.gateway.js';

describe('ChatGateway WebSocket Server', () => {
  let server: http.Server;
  let port: number;

  before(async () => {
    server = createHttpServer();
    chatGateway.initialize(server);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (typeof addr === 'object' && addr) {
          port = addr.port;
        }
        resolve();
      });
    });
  });

  after(() => {
    chatGateway.close();
    server.close();
  });

  it('connects and receives connected greeting event', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);

    const message = await new Promise<any>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), 2000);
      ws.on('message', (data) => {
        clearTimeout(timer);
        resolve(JSON.parse(data.toString()));
      });
    });

    assert.equal(message.type, 'connected');
    assert.ok(message.payload.sessionId);
    ws.close();
  });

  it('handles session:join and chat:message over websocket', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    const received: any[] = [];

    ws.on('message', (d) => {
      try {
        received.push(JSON.parse(d.toString()));
      } catch {}
    });

    await new Promise<void>((resolve) => ws.on('open', resolve));

    const waitFor = (predicate: (msg: any) => boolean, timeout = 3000): Promise<any> => {
      return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
          const idx = received.findIndex(predicate);
          if (idx !== -1) {
            resolve(received.splice(idx, 1)[0]);
            return;
          }
          if (Date.now() - start > timeout) {
            reject(new Error('Timed out waiting for message'));
            return;
          }
          setTimeout(check, 20);
        };
        check();
      });
    };

    // Wait for initial connection
    const connMsg = await waitFor((m) => m.type === 'connected');
    assert.equal(connMsg.type, 'connected');

    // Send session:join
    ws.send(JSON.stringify({
      type: 'session:join',
      payload: { sessionId: 'ws-test-session', language: 'uz' },
    }));

    const joinAck = await waitFor((m) => m.type === 'session:ready');
    assert.equal(joinAck.payload.sessionId, 'ws-test-session');

    // Send chat:message
    ws.send(JSON.stringify({
      type: 'chat:message',
      payload: { text: 'Assalomu alaykum!' },
    }));

    const responseMsg = await waitFor((m) => m.type === 'chat:response');
    assert.ok(responseMsg.payload);
    assert.equal(responseMsg.payload.detectedLanguage, 'uz');
    assert.ok(responseMsg.payload.replyText.length > 5);

    ws.close();
  });
});
