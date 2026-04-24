'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, Activity } from 'lucide-react';
import ProjectSelector from './components/ProjectSelector';
import PlanList from './components/PlanList';
import SourceManager from './components/SourceManager';
import KeywordManager from './components/KeywordManager';
import RunButton from './components/RunButton';
import StatsCards from './components/StatsCards';
import WordCloud from './components/WordCloud';
import ItemList from './components/ItemList';
import JobHistory from './components/JobHistory';
import AiAnalyzer from './components/AiAnalyzer';
import * as api from '../lib/api';
import type { CollectionPlan, CollectionResults, CollectionJob, RawItem } from '../types';

interface Project {
  id: string;
  name: string;
  description?: string;
  itemCount?: number;
}

export default function Dashboard() {
  const [projectId, setProjectId] = useState('proj-001');
  const [projects, setProjects] = useState<Project[]>([]);
  const [plans, setPlans] = useState<CollectionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<CollectionPlan | null>(null);
  const [results, setResults] = useState<CollectionResults | null>(null);
  const [selectedItem, setSelectedItem] = useState<RawItem | null>(null);
  const [jobs, setJobs] = useState<CollectionJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'results' | 'jobs' | 'ai'>('details');

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (projectId) loadPlans(); }, [projectId]);
  useEffect(() => { if (selectedPlan) { loadResults(); loadJobs(); } }, [selectedPlan?.id, projectId]);

  async function loadProjects() {
    setProjects([
      { id: 'proj-001', name: 'AI News', description: 'Latest AI news from RSS feeds', itemCount: 156 },
      { id: 'proj-002', name: 'Tech Trends', description: 'Technology trends monitoring', itemCount: 89 },
      { id: 'proj-003', name: 'Market Analysis', description: 'Market research data', itemCount: 234 },
    ]);
  }

  async function loadPlans() {
    setLoading(true);
    try {
      const data = await api.listCollectionPlans(projectId);
      setPlans(data);
      if (data.length > 0 && !selectedPlan) setSelectedPlan(data[0]);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function loadResults() {
    if (!selectedPlan) return;
    try { setResults(await api.getCollectionResults(selectedPlan.id, projectId)); }
    catch (err: any) { console.error(err); }
  }

  async function loadJobs() {
    if (!selectedPlan) return;
    try { setJobs(await api.getCollectionJobs(selectedPlan.id, projectId)); }
    catch (err: any) { console.error(err); }
  }

  async function handleCreatePlan(question: string, frequency: string) {
    if (!question) return;
    try {
      const plan = await api.createCollectionPlan({ projectId, question, frequency });
      setPlans([...plans, plan]);
      setSelectedPlan(plan);
    } catch (err: any) { setError(err.message); }
  }

  async function handleDeletePlan(id: string) {
    try {
      await api.deleteCollectionPlan(id, projectId);
      setPlans(plans.filter(p => p.id !== id));
      if (selectedPlan?.id === id) setSelectedPlan(plans[0] || null);
    } catch (err: any) { setError(err.message); }
  }

  async function handleRunCollection() {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      await api.runCollection(selectedPlan.id, projectId);
      await loadResults();
      await loadJobs();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded-lg">
              <Activity className="w-5 h-5 text-slate-400" />
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              Sentinel Intelligence
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search..." className="bg-slate-800 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-2 text-sm w-64" />
            </div>
            <ProjectSelector projects={projects} projectId={projectId} onChange={setProjectId} />
            <button onClick={loadPlans} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg">
              <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-slate-900/50 border-r border-slate-700 min-h-[calc(100vh-73px)] transition-all overflow-hidden`}>
          <div className="p-4">
            <ProjectSelector projects={projects} projectId={projectId} simple />
            <PlanList
              plans={plans}
              selectedPlan={selectedPlan}
              loading={loading}
              onSelect={setSelectedPlan}
              onDelete={handleDeletePlan}
              onCreate={handleCreatePlan}
            />
          </div>
        </aside>

        <main className="flex-1 p-6">
          {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">{error}</div>}
          
          {selectedPlan ? (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{selectedPlan.question}</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">{selectedPlan.frequency}</span>
                      <span className="text-sm text-slate-400">
                        Last: {selectedPlan.lastCollectedAt ? new Date(selectedPlan.lastCollectedAt).toLocaleString() : 'Never'}
                      </span>
                    </div>
                  </div>
                  <RunButton loading={loading} onClick={handleRunCollection} disabled={!selectedPlan.sources?.length} />
                </div>
                <div className="flex gap-1 border-b border-slate-700 mt-4">
                  {[{ id: 'details', label: 'Details' }, { id: 'results', label: 'Results', count: results?.total || 0 }, { id: 'jobs', label: 'Jobs', count: jobs.length }, { id: 'ai', label: 'AI Analysis' }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-3 text-sm border-b-2 ${activeTab === tab.id ? 'text-blue-400 border-blue-400' : 'text-slate-400 border-transparent'}`}>
                      {tab.label} {tab.count !== undefined && <span className="ml-2 px-2 py-0.5 bg-slate-700 rounded-full text-xs">{tab.count}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'details' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SourceManager plan={selectedPlan} projectId={projectId} onRefresh={loadPlans} />
                  <KeywordManager plan={selectedPlan} projectId={projectId} onRefresh={loadPlans} />
                </div>
              )}

              {activeTab === 'results' && results && (
                <div className="space-y-6">
                  <StatsCards results={results} plan={selectedPlan} />
                  <WordCloud wordCloud={results.wordCloud} />
                  <ItemList items={results.items} selectedItem={selectedItem} onSelect={setSelectedItem} />
                </div>
              )}

              {activeTab === 'jobs' && <JobHistory jobs={jobs} />}

              {activeTab === 'ai' && <AiAnalyzer />}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
              <p className="text-lg">No plan selected</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}