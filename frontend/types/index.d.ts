export interface CollectionPlan {
  id: string;
  projectId: string;
  question: string;
  frequency: string;
  isActive: boolean;
  lastCollectedAt?: string;
  createdAt: string;
  sources?: Source[];
  keywords?: Keyword[];
}

export interface Source {
  id: string;
  collectionPlanId: string;
  type: 'RSS' | 'WEB' | 'PDF';
  label?: string;
  url: string;
  isActive: boolean;
}

export interface Keyword {
  id: string;
  collectionPlanId: string;
  word: string;
  type: 'INCLUDE' | 'EXCLUDE';
}

export interface RawItem {
  id: string;
  sourceUrl: string;
  sourceType: string;
  title?: string;
  description?: string;
  contentRaw: string;
  publishedAt?: string;
  fetchedAt: string;
  mathedKeywords?: string[];
  wordStats?: WordStat[];
  aiAnalysis?: AiAnalysis;
}

export interface WordStat {
  text: string;
  value: number;
}

export interface AiAnalysis {
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  entities: {
    text: string;
    type: string;
    relevance: number;
  }[];
  classification: {
    category: string;
    subcategory?: string;
    confidence: number;
  };
}

export interface CollectionResults {
  items: RawItem[];
  wordCloud: WordStat[];
  total: number;
}

export interface CollectionJob {
  id: string;
  collectionPlanId: string;
  triggeredBy: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PENDING';
  itemsCollected: number;
  itemsFiltered: number;
  itemsStored: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export interface CollectionResult {
  success: boolean;
  collected: number;
  items: RawItem[];
  wordCloud: WordStat[];
}
