import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { languageDetectorService } from '../modules/language/language-detector.service.js';

describe('LanguageDetectorService', () => {
  it('detects Uzbek language correctly', () => {
    const res = languageDetectorService.detect('Assalomu alaykum! Biz uchun bu shartnoma juda muhim va kerak.');
    assert.equal(res.language, 'uz');
    assert.ok(res.confidence >= 0.65);
    assert.ok(res.matchedTokens.includes('uchun') || res.matchedTokens.includes('va') || res.matchedTokens.includes('kerak'));
  });

  it('detects Cyrillic Uzbek language with specific characters', () => {
    const res = languageDetectorService.detect('Ўзбекистон Республикаси қонунлари бўйича хизмат кўрсатиш');
    assert.equal(res.language, 'uz');
    assert.ok(res.confidence >= 0.65);
  });

  it('detects Russian language correctly', () => {
    const res = languageDetectorService.detect('Здравствуйте! Подскажите, пожалуйста, как работает этот сервис?');
    assert.equal(res.language, 'ru');
    assert.ok(res.confidence >= 0.65);
  });

  it('detects English language correctly', () => {
    const res = languageDetectorService.detect('Hello, how can this assistant help me with translation today?');
    assert.equal(res.language, 'en');
    assert.ok(res.confidence >= 0.65);
  });

  it('detects Spanish language correctly', () => {
    const res = languageDetectorService.detect('Hola, buenos días, necesito ayuda con el servicio por favor.');
    assert.equal(res.language, 'es');
    assert.ok(res.confidence >= 0.65);
  });

  it('detects German language correctly', () => {
    const res = languageDetectorService.detect('Hallo, wie kann ich dieses System für mein Unternehmen nutzen?');
    assert.equal(res.language, 'de');
    assert.ok(res.confidence >= 0.65);
  });

  it('detects French language correctly', () => {
    const res = languageDetectorService.detect('Bonjour, comment puis-je utiliser cette application avec plaisir?');
    assert.equal(res.language, 'fr');
    assert.ok(res.confidence >= 0.65);
  });

  it('detects Turkish language correctly', () => {
    const res = languageDetectorService.detect('Merhaba, bu platform hakkında daha fazla bilgi almak istiyorum.');
    assert.equal(res.language, 'tr');
    assert.ok(res.confidence >= 0.65);
  });

  it('detects Chinese language correctly', () => {
    const res = languageDetectorService.detect('你好，请帮我翻译这段文字');
    assert.equal(res.language, 'zh');
    assert.ok(res.confidence >= 0.9);
  });

  it('handles empty or blank text gracefully', () => {
    const res = languageDetectorService.detect('   ');
    assert.equal(res.language, 'en');
    assert.equal(res.confidence, 0.5);
  });
});
