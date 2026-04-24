import { Injectable, Logger } from '@nestjs/common';

interface Keyword {
  id: string;
  word: string;
  type: string;
}

@Injectable()
export class KeywordFilterService {
  private readonly logger = new Logger(KeywordFilterService.name);

  /**
   * Vérifie si un texte match les règles de keywords
   * - INCLUDE: au moins un mot-clé doit être présent
   * - EXCLUDE: aucun mot-clé ne doit être présent
   */
  match(text: string, keywords: Keyword[]): boolean {
    if (!text || !keywords?.length) return true;

    const lowerText = text.toLowerCase();
    
    const includeKeywords = keywords
      .filter(k => k.type === 'INCLUDE')
      .map(k => k.word.toLowerCase());
    
    const excludeKeywords = keywords
      .filter(k => k.type === 'EXCLUDE')
      .map(k => k.word.toLowerCase());

    if (excludeKeywords.some(kw => lowerText.includes(kw))) {
      return false;
    }

    if (includeKeywords.length > 0) {
      return includeKeywords.some(kw => lowerText.includes(kw));
    }

    return true;
  }

  getMatchedKeywords(text: string, keywords: Keyword[]): string[] {
    const matched: string[] = [];
    const lowerText = text.toLowerCase();
    
    const includeKeywords = keywords
      .filter(k => k.type === 'INCLUDE')
      .map(k => k.word.toLowerCase());

    for (const word of includeKeywords) {
      if (lowerText.includes(word)) {
        matched.push(word);
      }
    }

    return matched;
  }
}