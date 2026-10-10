export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  matchedTokens: string[];
}

export class LanguageDetectorService {
  private readonly STOPWORDS: Record<string, string[]> = {
    uz: [
      'va', 'bilan', 'uchun', 'hamda', 'qanday', 'nima', 'yaxshi', 'salom', 'rahmat',
      'qiling', 'boladi', 'kerak', 'emas', 'haqida', 'boyicha', 'bu', 'shu', 'siz',
      'men', 'biz', 'u', 'ozbekiston', 'qachon', 'qayerda', 'shartnoma', 'yordam'
    ],
    ru: [
      'и', 'в', 'не', 'на', 'что', 'как', 'это', 'для', 'с', 'по', 'привет', 'спасибо',
      'почему', 'где', 'когда', 'договор', 'пожалуйста', 'можно', 'нужно', 'здравствуйте',
      'хорошо', 'все', 'меня', 'тебя', 'мы', 'они'
    ],
    en: [
      'the', 'and', 'is', 'in', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are',
      'with', 'as', 'hello', 'how', 'what', 'why', 'where', 'when', 'thanks', 'thank',
      'please', 'good', 'assistant', 'help', 'can', 'will', 'this'
    ],
    es: [
      'el', 'la', 'de', 'que', 'en', 'los', 'del', 'se', 'las', 'por', 'un', 'para',
      'con', 'no', 'una', 'su', 'hola', 'gracias', 'como', 'ayuda', 'buenos'
    ],
    de: [
      'der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des',
      'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'hallo', 'danke', 'wie', 'hilfe'
    ],
    fr: [
      'le', 'la', 'les', 'de', 'des', 'un', 'une', 'et', 'en', 'du', 'que', 'qui',
      'dans', 'pour', 'bonjour', 'merci', 'comment', 'aide', 'avec'
    ],
    tr: [
      've', 'bir', 'bu', 'da', 'de', 'icin', 'için', 'ile', 'ne', 'nasil', 'nasıl',
      'merhaba', 'tesekkurler', 'teşekkürler', 'yardim', 'yardım', 'lutfen', 'lütfen'
    ],
  };

  detect(text: string): LanguageDetectionResult {
    const cleaned = text.toLowerCase().trim();
    if (!cleaned) {
      return { language: 'en', confidence: 0.5, matchedTokens: [] };
    }

    // Chinese detection via unicode script range
    if (/[\u4e00-\u9fa5]/.test(cleaned)) {
      return { language: 'zh', confidence: 0.95, matchedTokens: ['cjk_character'] };
    }

    const words = cleaned.match(/[\p{L}\p{N}'`ʻ-]+/gu) || [];
    const wordSet = new Set(words);

    const scores: Record<string, { count: number; tokens: string[] }> = {};

    for (const [lang, list] of Object.entries(this.STOPWORDS)) {
      scores[lang] = { count: 0, tokens: [] };
      for (const sw of list) {
        if (wordSet.has(sw)) {
          scores[lang].count += 1;
          scores[lang].tokens.push(sw);
        }
      }
    }

    // Check Cyrillic vs Latin for RU / UZ
    const isCyrillic = /[а-яё]/i.test(cleaned);
    if (isCyrillic) {
      // Could be Russian or Cyrillic Uzbek
      if (/[ўқғҳ]/i.test(cleaned)) {
        scores['uz'].count += 3;
        scores['uz'].tokens.push('uzbek_cyrillic_chars');
      } else {
        scores['ru'].count += 1.5;
      }
    }

    // Find highest scoring language
    let bestLang = 'en';
    let maxScore = 0;
    let bestTokens: string[] = [];

    for (const [lang, val] of Object.entries(scores)) {
      if (val.count > maxScore) {
        maxScore = val.count;
        bestLang = lang;
        bestTokens = val.tokens;
      }
    }

    if (maxScore === 0) {
      // Fallback: check if text has Latin vs Cyrillic
      if (isCyrillic) return { language: 'ru', confidence: 0.6, matchedTokens: [] };
      return { language: 'en', confidence: 0.6, matchedTokens: [] };
    }

    const confidence = Math.min(0.99, Math.max(0.65, maxScore / (maxScore + 1.5)));

    return {
      language: bestLang,
      confidence: Math.round(confidence * 100) / 100,
      matchedTokens: bestTokens.slice(0, 5),
    };
  }
}

export const languageDetectorService = new LanguageDetectorService();
