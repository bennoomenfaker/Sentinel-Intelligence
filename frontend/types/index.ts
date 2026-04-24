export interface CollectionPlan {
  id: string;
  hypothesisId: string;
  projectId: string;
  question: string;
  frequency: 'ON_DEMAND' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  isActive: boolean;
  lastCollectedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
}

export interface Keyword {
  id: string;
  collectionPlanId: string;
  word: string;
  type: 'INCLUDE' | 'EXCLUDE';
  createdAt: string;
}

export interface RawItem {
  id: string;
  projectId: string;
  collectionPlanId: string;
  sourceId?: string;
  sourceType: string;
  sourceUrl: string;
  title?: string;
  description?: string;
  contentRaw: string;
  contentHash: string;
  matchedKeywords: string[];
  wordStats: WordStat[];
  fetchedAt: string;
  createdAt: string;
}

export interface WordStat {
  text: string;
  value: number;
}

export interface CollectionJob {
  id: string;
  collectionPlanId: string;
  projectId: string;
  triggeredBy: 'MANUAL' | 'SCHEDULER';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
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

export interface CollectionResults {
  items: RawItem[];
  wordCloud: WordStat[];
  total: number;
}