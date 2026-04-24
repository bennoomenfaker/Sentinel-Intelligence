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
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'est', 'en', 'que', 'qui',
    'dans', 'ce', 'ci', 'ne', 'pas', 'plus', 'par', 'au', 'sur', 'se', 'sont', 'avec',
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'à', 'y', 'a', 'été',
    'être', 'avoir', 'fait', 'faire', 'peut', 'pouvoir', 'comme', 'mais', 'donc', 'car',
    'ou', 'donc', 'si', 'n', 't', 'l', 'd', 'c', 'j', 'm', 'q', 'qu', 'quand',
    'this', 'that', 'the', 'and', 'or', 'is', 'are', 'was', 'were', 'be', 'to',
    'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'an', 'it', 'its',
  ]);

  analyze(text: string, limit = 20): WordStat[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.STOPWORDS.has(word));

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