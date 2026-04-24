import axios from 'axios';
import type { 
  CollectionPlan, 
  Source, 
  Keyword, 
  RawItem, 
  CollectionJob,
  CollectionResult,
  CollectionResults 
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Collection Plans
export async function createCollectionPlan(data: {
  projectId: string;
  question: string;
  hypothesisId?: string;
  frequency?: string;
}) {
  const res = await api.post<CollectionPlan>('/collection-plans', data);
  return res.data;
}

export async function listCollectionPlans(projectId: string) {
  const res = await api.get<CollectionPlan[]>('/collection-plans', { params: { projectId } });
  return res.data;
}

export async function getCollectionPlan(id: string, projectId: string) {
  const res = await api.get<CollectionPlan>(`/collection-plans/${id}`, { 
    params: { projectId } 
  });
  return res.data;
}

export async function deleteCollectionPlan(id: string, projectId: string) {
  await api.delete(`/collection-plans/${id}`, { params: { projectId } });
}

// Sources
export async function addSource(
  planId: string, 
  projectId: string, 
  data: { type: string; url: string; label?: string }
) {
  const res = await api.post<Source>(`/collection-plans/${planId}/sources`, data, {
    params: { projectId },
  });
  return res.data;
}

export async function deleteSource(
  planId: string, 
  sourceId: string, 
  projectId: string
) {
  await api.delete(`/collection-plans/${planId}/sources/${sourceId}`, { 
    params: { projectId } 
  });
}

// Keywords
export async function addKeyword(
  planId: string, 
  projectId: string, 
  data: { word: string; type?: string }
) {
  const res = await api.post<Keyword>(`/collection-plans/${planId}/keywords`, data, {
    params: { projectId },
  });
  return res.data;
}

export async function deleteKeyword(
  planId: string, 
  keywordId: string, 
  projectId: string
) {
  await api.delete(`/collection-plans/${planId}/keywords/${keywordId}`, { 
    params: { projectId } 
  });
}

// Collection
export async function runCollection(planId: string, projectId: string) {
  const res = await api.post<CollectionResult>(
    `/collection-plans/${planId}/run`,
    {},
    { params: { projectId } }
  );
  return res.data;
}

export async function triggerCollection(planId: string, projectId: string) {
  const res = await api.post<{ jobId: string; status: string; message: string }>(
    `/collection-plans/${planId}/collect`,
    {},
    { params: { projectId } }
  );
  return res.data;
}

export async function getCollectionItems(planId: string, projectId: string) {
  const res = await api.get<{ items: RawItem[]; wordCloud: any[] }>(
    `/collection-plans/${planId}/items`,
    { params: { projectId } }
  );
  return res.data;
}

export async function getCollectionResults(planId: string, projectId: string) {
  const res = await api.get<CollectionResults>(
    `/collection-plans/${planId}/results`,
    { params: { projectId } }
  );
  return res.data;
}

export async function getCollectionJobs(planId: string, projectId: string) {
  const res = await api.get<CollectionJob[]>(
    `/collection-plans/${planId}/jobs`,
    { params: { projectId } }
  );
  return res.data;
}

// AI Analysis
export async function analyzeWithAi(content: string) {
  const res = await api.post('/collection-plans/ai/analyze', { content });
  return res.data;
}

export default api;