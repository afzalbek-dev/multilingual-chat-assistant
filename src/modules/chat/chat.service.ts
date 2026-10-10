import { databaseService, ChatMessageEntity } from '../../database/database.service.js';
import { languageDetectorService, LanguageDetectionResult } from '../language/language-detector.service.js';
import { translatorService } from '../language/translator.service.js';
import { knowledgeService, KnowledgeMatch } from '../rag/knowledge.service.js';

export interface ChatResponse {
  messageId: string;
  sessionId: string;
  replyText: string;
  detectedLanguage: string;
  languageConfidence: number;
  sources: KnowledgeMatch[];
  createdAt: string;
}

export class ChatService {
  async processUserMessage(sessionId: string, userText: string, forcedLanguage?: string): Promise<ChatResponse> {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    // 1. Language Detection
    const detection: LanguageDetectionResult = languageDetectorService.detect(userText);
    const activeLanguage = forcedLanguage || detection.language;

    // 2. Save user message
    const userMsg: ChatMessageEntity = {
      id: `usr-${messageId}`,
      session_id: sessionId,
      role: 'user',
      original_text: userText,
      detected_language: detection.language,
      confidence: detection.confidence,
      created_at: now,
    };
    await databaseService.saveMessage(userMsg);

    // 3. Multilingual RAG Search
    const knowledgeMatches = await knowledgeService.search(userText, activeLanguage, 2);

    // 4. Multi-turn History Context
    const history = await databaseService.getMessages(sessionId);

    // 5. Generate Localized Response
    const replyText = this.generateLocalizedResponse(userText, activeLanguage, knowledgeMatches, history.length);

    // 6. Save assistant message
    const botMsg: ChatMessageEntity = {
      id: messageId,
      session_id: sessionId,
      role: 'assistant',
      original_text: replyText,
      detected_language: activeLanguage,
      confidence: 1.0,
      created_at: new Date().toISOString(),
    };
    await databaseService.saveMessage(botMsg);

    return {
      messageId,
      sessionId,
      replyText,
      detectedLanguage: activeLanguage,
      languageConfidence: detection.confidence,
      sources: knowledgeMatches,
      createdAt: now,
    };
  }

  private generateLocalizedResponse(
    query: string,
    lang: string,
    sources: KnowledgeMatch[],
    turnCount: number
  ): string {
    const qLower = query.toLowerCase();

    // Check greeting
    if (qLower.includes('salom') || qLower.includes('hello') || qLower.includes('привет') || qLower.includes('hola') || turnCount <= 2 && query.length < 10) {
      return translatorService.getGreeting(lang);
    }

    // Incorporate RAG Knowledge source if available
    let knowledgeSnippet = '';
    if (sources.length > 0 && sources[0].relevanceScore > 1.0) {
      const top = sources[0];
      if (lang === 'uz') {
        knowledgeSnippet = `\n\nMa'lumotlar bazasidan (${top.title}): ${top.contentSnippet}`;
      } else if (lang === 'ru') {
        knowledgeSnippet = `\n\nИз базы знаний (${top.title}): ${top.contentSnippet}`;
      } else {
        knowledgeSnippet = `\n\nFrom Knowledge Base (${top.title}): ${top.contentSnippet}`;
      }
    }

    // Localized responses based on detected/preferred language
    switch (lang) {
      case 'uz':
        return `Savolingiz qabul qilindi: "${query}". Ko'p tilli yordamchi sifatida sizga ushbu mavzu bo'yicha to'liq ma'lumot taqdim eta olaman.${knowledgeSnippet}\n\nQo'shimcha savollaringiz bo'lsa, marhamat!`;
      case 'ru':
        return `Ваш запрос принят: "${query}". Как мультиязычный ассистент, я готов предоставить вам детальные сведения по данной теме.${knowledgeSnippet}\n\nЕсли у вас есть дополнительные вопросы, пожалуйста, задавайте!`;
      case 'es':
        return `Tu consulta ha sido procesada: "${query}". Como asistente multilingüe, puedo brindarte asistencia detallada sobre este tema.${knowledgeSnippet}`;
      case 'de':
        return `Ihre Anfrage wurde verarbeitet: "${query}". Als mehrsprachiger Assistent stehe ich Ihnen gerne zur Verfügung.${knowledgeSnippet}`;
      case 'fr':
        return `Votre demande a été traitée: "${query}". En tant qu'assistant multilingue, je suis à votre disposition.${knowledgeSnippet}`;
      case 'tr':
        return `Talebiniz alındı: "${query}". Çok dilli asistan olarak size bu konuda yardımcı olmaktan memnuniyet duyarım.${knowledgeSnippet}`;
      case 'zh':
        return `您的查询已接收: "${query}"。作为多语言AI助手，我很乐意为您提供帮助。${knowledgeSnippet}`;
      case 'en':
      default:
        return `Received your query: "${query}". As your multilingual assistant, I am ready to help you explore this topic in detail.${knowledgeSnippet}\n\nFeel free to ask any follow-up questions!`;
    }
  }
}

export const chatService = new ChatService();
