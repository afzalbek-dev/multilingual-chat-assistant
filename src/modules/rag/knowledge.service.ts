import { databaseService, KnowledgeDocEntity } from '../../database/database.service.js';

export interface KnowledgeMatch {
  documentId: string;
  title: string;
  contentSnippet: string;
  language: string;
  category: string;
  relevanceScore: number;
}

export class KnowledgeService {
  private tokenize(text: string): string[] {
    return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  }

  async search(query: string, language?: string, topK = 3): Promise<KnowledgeMatch[]> {
    const docs = await databaseService.listKnowledgeDocs();
    const queryTokens = this.tokenize(query);

    if (queryTokens.length === 0) {
      return [];
    }

    const scoredDocs: KnowledgeMatch[] = [];

    for (const doc of docs) {
      const docTokens = this.tokenize(`${doc.title} ${doc.content} ${(doc.tags || []).join(' ')}`);
      const docTokenSet = new Set(docTokens);

      let score = 0;

      // Exact term overlap
      for (const qToken of queryTokens) {
        if (docTokenSet.has(qToken)) {
          score += 1.0;
        }
      }

      // Exact query substring bonus
      const qLower = query.toLowerCase().trim();
      if (qLower.length > 3 && doc.content.toLowerCase().includes(qLower)) {
        score += 2.5;
      }

      // Language boost if user language matches document language
      if (language && doc.language === language) {
        score += 0.5;
      }

      if (score > 0) {
        const snippet = doc.content.length > 200 ? `${doc.content.slice(0, 200)}...` : doc.content;
        scoredDocs.push({
          documentId: doc.id,
          title: doc.title,
          contentSnippet: snippet,
          language: doc.language,
          category: doc.category,
          relevanceScore: Math.round(score * 100) / 100,
        });
      }
    }

    scoredDocs.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return scoredDocs.slice(0, topK);
  }

  async addDocument(doc: KnowledgeDocEntity): Promise<void> {
    await databaseService.saveKnowledgeDoc(doc);
  }

  async getAll(): Promise<KnowledgeDocEntity[]> {
    return databaseService.listKnowledgeDocs();
  }
}

export const knowledgeService = new KnowledgeService();
