import { Injectable, Logger } from '@nestjs/common';

export interface SentimentResult {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface Entity {
  text: string;
  type: 'PERSON' | 'ORG' | 'PRODUCT' | 'TECHNOLOGY' | 'LOCATION';
  relevance: number;
}

export interface ClassificationResult {
  category: string;
  subcategory?: string;
  confidence: number;
}

@Injectable()
export class AiProcessingService {
  private readonly logger = new Logger(AiProcessingService.name);

  private readonly categories = [
    'technology', 'business', 'science', 'health', 'politics',
    'entertainment', 'sports', 'finance', 'security', 'AI'
  ];

  private readonly keywords: Record<string, string[]> = {
    technology: ['software', 'hardware', 'AI', 'machine learning', 'cloud', 'digital'],
    business: ['company', 'startup', 'funding', 'revenue', 'market', ' IPO'],
    science: ['research', 'study', 'discovery', 'breakthrough', 'experiment'],
    health: ['health', 'medical', 'doctor', 'treatment', 'disease', 'patient'],
    politics: ['government', 'policy', 'law', 'election', 'minister', 'president'],
    security: ['hack', 'breach', 'security', 'attack', 'vulnerability', 'malware'],
    AI: ['GPT', 'LLM', 'neural', 'model', 'training', 'deep learning'],
  };

  analyzeSentiment(content: string): SentimentResult {
    const positive = ['good', 'great', 'excellent', 'amazing', 'best', 'success', 'grow', 'improve', 'strong', 'profit', 'growth', 'innovation', 'breakthrough'];
    const negative = ['bad', 'fail', 'worst', 'loss', 'decline', 'weak', 'problem', 'issue', 'bug', 'crash', 'breach', 'hack', 'attack'];
    
    const lower = content.toLowerCase();
    let posCount = 0;
    let negCount = 0;

    positive.forEach(w => { if (lower.includes(w)) posCount++; });
    negative.forEach(w => { if (lower.includes(w)) negCount++; });

    const total = posCount + negCount || 1;
    const score = (posCount - negCount) / total;
    
    let label: 'positive' | 'negative' | 'neutral';
    if (score > 0.1) label = 'positive';
    else if (score < -0.1) label = 'negative';
    else label = 'neutral';

    return {
      score,
      label,
      confidence: Math.min(Math.abs(score), 1),
    };
  }

  extractEntities(content: string): Entity[] {
    const entities: Entity[] = [];
    const lower = content.toLowerCase();

    const techPatterns = [
      { pattern: /gpt[- ]?\d*/gi, type: 'TECHNOLOGY' as const },
      { pattern: /chatgpt/gi, type: 'TECHNOLOGY' as const },
      { pattern: /clang\b/gi, type: 'TECHNOLOGY' as const },
      { pattern: /python\b/gi, type: 'TECHNOLOGY' as const },
      { pattern: /javascript/gi, type: 'TECHNOLOGY' as const },
      { pattern: /aws\b/gi, type: 'TECHNOLOGY' as const },
      { pattern: /google\b/gi, type: 'ORG' as const },
      { pattern: /microsoft\b/gi, type: 'ORG' as const },
      { pattern: /openai\b/gi, type: 'ORG' as const },
      { pattern: /meta\b/gi, type: 'ORG' as const },
      { pattern: /amazon\b/gi, type: 'ORG' as const },
      { pattern: /apple\b/gi, type: 'ORG' as const },
      { pattern: /nvidia\b/gi, type: 'ORG' as const },
    ];

    for (const { pattern, type } of techPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!entities.find(e => e.text.toLowerCase() === match.toLowerCase())) {
            entities.push({ text: match, type, relevance: 0.8 });
          }
        });
      }
    }

    return entities.slice(0, 10);
  }

  classifyContent(content: string): ClassificationResult {
    const lower = content.toLowerCase();
    let bestCategory = 'technology';
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(this.keywords)) {
      let score = 0;
      keywords.forEach(kw => {
        if (lower.includes(kw)) score++;
      });
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    return {
      category: bestCategory,
      confidence: Math.min(bestScore / 3, 1),
    };
  }

  processAll(content: string) {
    const sentiment = this.analyzeSentiment(content);
    const entities = this.extractEntities(content);
    const classification = this.classifyContent(content);

    return { sentiment, entities, classification };
  }
}