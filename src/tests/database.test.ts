import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { databaseService } from '../database/database.service.js';

describe('DatabaseService', () => {
  before(async () => {
    await databaseService.initialize();
  });

  it('creates and retrieves a chat session', async () => {
    const sessionId = `test-sess-${Date.now()}`;
    const session = await databaseService.createSession(sessionId, 'Test Project', 'test-user', 'uz');

    assert.equal(session.id, sessionId);
    assert.equal(session.title, 'Test Project');
    assert.equal(session.preferred_language, 'uz');

    const retrieved = await databaseService.getSession(sessionId);
    assert.ok(retrieved);
    assert.equal(retrieved.id, sessionId);
  });

  it('saves and retrieves chat messages within a session', async () => {
    const sessionId = `test-msg-sess-${Date.now()}`;
    await databaseService.createSession(sessionId, 'Message Session');

    await databaseService.saveMessage({
      id: 'm1',
      session_id: sessionId,
      role: 'user',
      original_text: 'Assalomu alaykum!',
      detected_language: 'uz',
      confidence: 0.95,
      created_at: new Date().toISOString(),
    });

    await databaseService.saveMessage({
      id: 'm2',
      session_id: sessionId,
      role: 'assistant',
      original_text: 'Vaalaykum assalom! Qanday yordam bera olaman?',
      detected_language: 'uz',
      confidence: 1.0,
      created_at: new Date().toISOString(),
    });

    const messages = await databaseService.getMessages(sessionId);
    assert.equal(messages.length, 2);
    assert.equal(messages[0].role, 'user');
    assert.equal(messages[1].role, 'assistant');
  });

  it('records feedback and computes analytics', async () => {
    await databaseService.saveFeedback({
      id: `fb-${Date.now()}`,
      message_id: 'm2',
      rating: 5,
      comments: 'Great response!',
      created_at: new Date().toISOString(),
    });

    const analytics = await databaseService.getAnalytics();
    assert.ok(analytics.total_sessions >= 2);
    assert.ok(analytics.total_messages >= 2);
    assert.ok(analytics.total_documents >= 3);
  });
});
