import pg from 'pg';
import { appConfig } from '../config/app.config.js';

export interface ChatSessionEntity {
  id: string;
  title: string;
  user_id: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageEntity {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  original_text: string;
  detected_language: string;
  translated_text?: string;
  confidence: number;
  created_at: string;
}

export interface KnowledgeDocEntity {
  id: string;
  title: string;
  content: string;
  language: string;
  category: string;
  tags: string[];
  created_at: string;
}

export interface UserFeedbackEntity {
  id: string;
  message_id: string;
  rating: number;
  comments?: string;
  created_at: string;
}

export class DatabaseService {
  private pool: pg.Pool | null = null;
  private isPostgresConnected = false;

  // In-memory storage fallback for zero-dependency local runs and tests
  private memSessions = new Map<string, ChatSessionEntity>();
  private memMessages = new Map<string, ChatMessageEntity[]>();
  private memDocs = new Map<string, KnowledgeDocEntity>();
  private memFeedbacks = new Map<string, UserFeedbackEntity>();

  constructor() {
    this.seedDefaultKnowledge();
  }

  async initialize(): Promise<void> {
    try {
      this.pool = new pg.Pool({
        connectionString: appConfig.databaseUrl,
        connectionTimeoutMillis: 2000,
      });

      const client = await this.pool.connect();
      client.release();
      this.isPostgresConnected = true;
      console.log('[Database] Connected to PostgreSQL server.');
    } catch {
      this.isPostgresConnected = false;
      console.log('[Database] PostgreSQL unreachable, running in memory-resilient store mode.');
    }
  }

  private seedDefaultKnowledge(): void {
    const seeds: KnowledgeDocEntity[] = [
      {
        id: 'doc-intro-en',
        title: 'Platform Overview',
        content: 'Multilingual Chat Assistant provides real-time cross-lingual conversation support, natural language translation, and intelligent context retrieval across 8+ languages including English, Uzbek, Russian, and Spanish.',
        language: 'en',
        category: 'general',
        tags: ['intro', 'overview', 'features'],
        created_at: new Date().toISOString(),
      },
      {
        id: 'doc-intro-uz',
        title: 'Platforma Haqida',
        content: 'Ko\'p tilli chat yordamchisi foydalanuvchilarga o\'zbek, rus, ingliz va boshqa tillarda real vaqt rejimida tezkor savol-javob, avtomatik tarjima va aqlli kontekstli qidiruvni taqdim etadi.',
        language: 'uz',
        category: 'general',
        tags: ['kirish', 'imkoniyatlar', 'o\'zbekcha'],
        created_at: new Date().toISOString(),
      },
      {
        id: 'doc-intro-ru',
        title: 'Обзор Платформы',
        content: 'Мультиязычный чат-ассистент обеспечивает кросс-языковую поддержку диалогов в реальном времени, автоматический перевод и поиск по базе знаний на русском, узбекском, английском и других языках.',
        language: 'ru',
        category: 'general',
        tags: ['обзор', 'возможности', 'русский'],
        created_at: new Date().toISOString(),
      },
      {
        id: 'doc-pricing-en',
        title: 'Subscription Plans',
        content: 'We offer Free Tier with 100 messages/day, Professional Tier with unlimited messages and WebSocket streaming, and Enterprise Tier with dedicated SLA and custom knowledge base fine-tuning.',
        language: 'en',
        category: 'billing',
        tags: ['pricing', 'subscription', 'plans'],
        created_at: new Date().toISOString(),
      },
    ];

    for (const doc of seeds) {
      this.memDocs.set(doc.id, doc);
    }
  }

  async createSession(id: string, title: string, userId = 'anonymous', preferredLanguage = 'en'): Promise<ChatSessionEntity> {
    const now = new Date().toISOString();
    const session: ChatSessionEntity = {
      id,
      title,
      user_id: userId,
      preferred_language: preferredLanguage,
      created_at: now,
      updated_at: now,
    };
    this.memSessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<ChatSessionEntity | null> {
    return this.memSessions.get(id) || null;
  }

  async listSessions(): Promise<ChatSessionEntity[]> {
    return Array.from(this.memSessions.values()).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }

  async saveMessage(msg: ChatMessageEntity): Promise<void> {
    const existing = this.memMessages.get(msg.session_id) || [];
    existing.push(msg);
    this.memMessages.set(msg.session_id, existing);

    // Update session timestamp
    const session = this.memSessions.get(msg.session_id);
    if (session) {
      session.updated_at = msg.created_at;
      this.memSessions.set(msg.session_id, session);
    }
  }

  async getMessages(sessionId: string): Promise<ChatMessageEntity[]> {
    return this.memMessages.get(sessionId) || [];
  }

  async saveKnowledgeDoc(doc: KnowledgeDocEntity): Promise<void> {
    this.memDocs.set(doc.id, doc);
  }

  async listKnowledgeDocs(): Promise<KnowledgeDocEntity[]> {
    return Array.from(this.memDocs.values());
  }

  async saveFeedback(fb: UserFeedbackEntity): Promise<void> {
    this.memFeedbacks.set(fb.id, fb);
  }

  async getAnalytics(): Promise<{
    total_sessions: number;
    total_messages: number;
    total_documents: number;
    languages_breakdown: Record<string, number>;
    is_postgres_active: boolean;
  }> {
    let totalMessages = 0;
    const languages: Record<string, number> = {};

    for (const msgList of this.memMessages.values()) {
      totalMessages += msgList.length;
      for (const m of msgList) {
        languages[m.detected_language] = (languages[m.detected_language] || 0) + 1;
      }
    }

    return {
      total_sessions: this.memSessions.size,
      total_messages: totalMessages,
      total_documents: this.memDocs.size,
      languages_breakdown: languages,
      is_postgres_active: this.isPostgresConnected,
    };
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

export const databaseService = new DatabaseService();
