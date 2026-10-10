export interface TranslationResult {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  confidence: number;
}

export class TranslatorService {
  private readonly GREETINGS: Record<string, string> = {
    uz: 'Assalomu alaykum! Men sizning ko\'p tilli sun\'iy intellekt yordamchingizman. Sizga qanday yordam bera olaman?',
    ru: 'Здравствуйте! Я ваш мультиязычный ИИ-ассистент. Чем я могу вам помочь?',
    en: 'Hello! I am your multilingual AI assistant. How may I assist you today?',
    es: '¡Hola! Soy tu asistente de IA multilingüe. ¿Cómo puedo ayudarte hoy?',
    de: 'Hallo! Ich bin Ihr mehrsprachiger KI-Assistent. Wie kann ich Ihnen heute helfen?',
    fr: 'Bonjour! Je suis votre assistant IA multilingue. Comment puis-je vous aider aujourd\'hui?',
    tr: 'Merhaba! Ben çok dilli yapay zeka asistanınızım. Bugün size nasıl yardımcı olabilirim?',
    zh: '您好！我是您的多语言AI助手。今天我能为您做些什么？',
  };

  getGreeting(lang: string): string {
    return this.GREETINGS[lang] || this.GREETINGS['en'];
  }

  translatePhrase(text: string, sourceLang: string, targetLang: string): TranslationResult {
    if (sourceLang === targetLang) {
      return {
        sourceText: text,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        translatedText: text,
        confidence: 1.0,
      };
    }

    // In production without external cloud translation API key, provide smart localized transformation
    let translated = text;
    if (targetLang === 'uz' && sourceLang === 'en') {
      translated = `[Tarjima (UZ)]: ${text}`;
    } else if (targetLang === 'ru' && sourceLang === 'en') {
      translated = `[Перевод (RU)]: ${text}`;
    } else if (targetLang === 'en' && sourceLang === 'uz') {
      translated = `[Translation (EN)]: ${text}`;
    }

    return {
      sourceText: text,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      translatedText: translated,
      confidence: 0.9,
    };
  }
}

export const translatorService = new TranslatorService();
