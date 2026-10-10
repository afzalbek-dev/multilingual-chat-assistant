import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { translatorService } from '../modules/language/translator.service.js';
import { knowledgeService } from '../modules/rag/knowledge.service.js';

describe('Translator and RAG Service', () => {
  it('returns localized greetings for different languages', () => {
    const uzGreet = translatorService.getGreeting('uz');
    assert.ok(uzGreet.includes('Assalomu alaykum'));

    const ruGreet = translatorService.getGreeting('ru');
    assert.ok(ruGreet.includes('Здравствуйте'));

    const enGreet = translatorService.getGreeting('en');
    assert.ok(enGreet.includes('Hello'));

    const esGreet = translatorService.getGreeting('es');
    assert.ok(esGreet.includes('Hola'));
  });

  it('translates phrases with high confidence', () => {
    const res = translatorService.translatePhrase('Welcome to the future', 'en', 'uz');
    assert.equal(res.sourceLanguage, 'en');
    assert.equal(res.targetLanguage, 'uz');
    assert.ok(res.confidence >= 0.8);
    assert.ok(res.translatedText.includes('Welcome to the future'));
  });

  it('searches knowledge base and returns relevant documents', async () => {
    const results = await knowledgeService.search('subscription plans pricing', 'en', 2);
    assert.ok(results.length > 0);
    assert.equal(results[0].category, 'billing');
    assert.ok(results[0].title.includes('Subscription'));
    assert.ok(results[0].relevanceScore > 1.0);
  });

  it('adds and indexes custom knowledge document', async () => {
    const docId = `test-doc-${Date.now()}`;
    await knowledgeService.addDocument({
      id: docId,
      title: 'API Rate Limits',
      content: 'The Multilingual Chat Assistant enforces rate limits of 100 requests per minute per IP.',
      language: 'en',
      category: 'technical',
      tags: ['rate-limit', 'api', 'security'],
      created_at: new Date().toISOString(),
    });

    const matches = await knowledgeService.search('rate limits requests', 'en');
    assert.ok(matches.length > 0);
    const found = matches.find(m => m.documentId === docId);
    assert.ok(found);
    assert.equal(found.title, 'API Rate Limits');
  });
});
