import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { createHttpServer } from '../http/http.server.js';

describe('HTTP API Endpoints', () => {
  let server: http.Server;
  let port: number;

  before(async () => {
    server = createHttpServer();
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
    server.close();
  });

  const get = async (path: string) => {
    const res = await fetch(`http://127.0.0.1:${port}${path}`);
    const data = await res.json();
    return { status: res.status, data };
  };

  const post = async (path: string, body: any) => {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  it('GET /health returns healthy status', async () => {
    const { status, data } = await get('/health');
    assert.equal(status, 200);
    assert.equal(data.status, 'healthy');
    assert.equal(data.app, 'multilingual-chat-assistant');
  });

  it('POST /api/v1/chat processes query via REST API', async () => {
    const { status, data } = await post('/api/v1/chat', {
      message: 'Привет! Какая сегодня погода?',
    });
    assert.equal(status, 200);
    assert.equal(data.detectedLanguage, 'ru');
    assert.ok(data.replyText.length > 5);
  });

  it('GET and POST /api/v1/knowledge manages knowledge docs', async () => {
    // Add doc
    const addRes = await post('/api/v1/knowledge', {
      title: 'Docker Deployment Guide',
      content: 'Run docker-compose up -d to launch multilingual chat assistant with PostgreSQL.',
      language: 'en',
      category: 'devops',
    });
    assert.equal(addRes.status, 201);

    // Search doc
    const searchRes = await get('/api/v1/knowledge?q=docker-compose');
    assert.equal(searchRes.status, 200);
    assert.ok(searchRes.data.results.length > 0);
  });

  it('GET /api/v1/sessions lists conversations', async () => {
    const { status, data } = await get('/api/v1/sessions');
    assert.equal(status, 200);
    assert.ok(typeof data.total === 'number');
  });

  it('GET /api/v1/analytics returns system metrics', async () => {
    const { status, data } = await get('/api/v1/analytics');
    assert.equal(status, 200);
    assert.ok(data.total_documents >= 1);
  });

  it('GET / returns HTML web client interface', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('Multilingual Chat Assistant'));
  });

  it('returns 404 for unknown route', async () => {
    const { status, data } = await get('/api/v1/unknown-endpoint');
    assert.equal(status, 404);
    assert.equal(data.error, 'Route not found');
  });
});
