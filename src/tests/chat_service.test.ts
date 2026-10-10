import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chatService } from '../modules/chat/chat.service.js';
import { databaseService } from '../database/database.service.js';

describe('ChatService', () => {
  it('processes user message in Uzbek and saves conversation turn', async () => {
    const sessionId = `chat-test-${Date.now()}`;
    await databaseService.createSession(sessionId, 'Uzbek Chat Session', 'user-1', 'uz');

    const res = await chatService.processUserMessage(sessionId, 'Salom! Menga yordam bera olasizmi?');
    assert.equal(res.sessionId, sessionId);
    assert.equal(res.detectedLanguage, 'uz');
    assert.ok(res.replyText.length > 10);

    const history = await databaseService.getMessages(sessionId);
    assert.equal(history.length, 2); // 1 user + 1 assistant
  });

  it('processes user message in English with RAG citation', async () => {
    const sessionId = `chat-en-${Date.now()}`;
    const res = await chatService.processUserMessage(sessionId, 'Tell me about the subscription plans');
    assert.equal(res.detectedLanguage, 'en');
    assert.ok(res.sources.length > 0);
    assert.ok(res.replyText.includes('Subscription') || res.replyText.includes('Knowledge Base'));
  });

  it('honors forced language override', async () => {
    const sessionId = `chat-forced-${Date.now()}`;
    const res = await chatService.processUserMessage(sessionId, 'How does this work?', 'es');
    assert.equal(res.detectedLanguage, 'es');
    assert.ok(res.replyText.includes('asistente') || res.replyText.includes('consulta'));
  });
});
