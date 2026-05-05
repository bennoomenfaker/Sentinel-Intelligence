import { Injectable, Logger } from '@nestjs/common';

export interface WordStat {
  text: string;
  value: number;
}

interface RawItemWithStats {
  wordStats: WordStat[] | any;
}

@Injectable()
export class WordAnalyzerService {
  private readonly logger = new Logger(WordAnalyzerService.name);
  
  private readonly STOPWORDS = new Set([
    // French
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'des', 'et', 'est', 'en', 'que', 'qui',
    'dans', 'ce', 'cette', 'ces', 'ne', 'pas', 'plus', 'par', 'au', 'aux', 'sur', 'se', 'sont', 'avec',
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'à', 'y', 'a', 'été',
    'être', 'avoir', 'fait', 'faire', 'peut', 'pouvoir', 'comme', 'mais', 'donc', 'car',
    'ou', 'si', 'n', 't', 'l', 'd', 'c', 'j', 'm', 'q', 'qu', 'quand', 'pour',
    'dans', 'avec', 'sans', 'sous', 'sur', 'entre', 'vers', 'depuis', 'pendant',
    'très', 'tout', 'tous', 'toute', 'toutes', 'bien', 'mal', 'ici', 'là', 'où',
    // English
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
    'this', 'that', 'these', 'those', 'it', 'its', 'it\'s', 'i', 'you', 'he', 'she',
    'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her',
    'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'shall', 'may', 'might', 'must', 'can', 'need', 'dare', 'ought',
    'what', 'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
    'because', 'before', 'after', 'above', 'below', 'between', 'through', 'during',
    'get', 'go', 'come', 'make', 'take', 'see', 'know', 'think', 'say', 'tell',
    'content', 'features', 'products', 'free', 'month', 'plan', 'marketing', 'affiliate',
    'help', 'digital', 'create', 'sellfy', 'canva', 'plr', 'also', 'use', 'using',
    'one', 'two', 'three', 'first', 'last', 'new', 'old', 'good', 'best', 'great',
    'want', 'need', 'like', 'love', 'hate', 'find', 'give', 'look', 'use', 'try',
  ]);

  analyze(text: string, limit = 20): WordStat[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.STOPWORDS.has(word) && !/^\d+$/.test(word));

    const counts = new Map<string, number>();
    
    for (const word of words) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }

    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([text, value]) => ({ text, value }));

    this.logger.log(`📊 Word analysis: ${counts.size} unique words, top ${sorted.length}`);
    return sorted;
  }

  getTopWords(text: string, limit = 20): WordStat[] {
    return this.analyze(text, limit);
  }

  aggregateWordCloud(items: RawItemWithStats[]): WordStat[] {
    const allWords = new Map<string, number>();

    for (const item of items) {
      if (item.wordStats) {
        const stats = Array.isArray(item.wordStats) ? item.wordStats : [];
        for (const stat of stats) {
          if (stat && stat.text) {
            allWords.set(stat.text, (allWords.get(stat.text) || 0) + (stat.value || 1));
          }
        }
      }
    }

    return Array.from(allWords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([text, value]) => ({ text, value }));
  }
}