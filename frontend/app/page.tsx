'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Play, RefreshCw, Search, 
  Rss, Globe, FileText, BarChart3, LayoutGrid,
  CheckCircle, XCircle, Clock, AlertCircle,
  TrendingUp, TrendingDown, PieChart, Activity,
  ChevronRight, FolderOpen, Database, Filter,
  MoreVertical, ExternalLink, Link2, Hash, Tag
} from 'lucide-react';
import * as api from '../lib/api';
import type { CollectionPlan, CollectionResults, CollectionJob, WordStat, RawItem } from '../types';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#ef4444'];

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
  
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newFrequency, setNewFrequency] = useState('ON_DEMAND');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceType, setNewSourceType] = useState('RSS');
  const [newSourceLabel, setNewSourceLabel] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newKeywordType, setNewKeywordType] = useState<'INCLUDE' | 'EXCLUDE'>('INCLUDE');
  const [activeTab, setActiveTab] = useState<'details' | 'results' | 'jobs'>('details');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadPlans();
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedPlan) {
      loadResults();
      loadJobs();
    }
  }, [selectedPlan?.id, projectId]);

  async function loadProjects() {
    try {
      const mockProjects: Project[] = [
        { id: 'proj-001', name: 'AI News', description: 'Latest AI news from RSS feeds', itemCount: 156 },
        { id: 'proj-002', name: 'Tech Trends', description: 'Technology trends monitoring', itemCount: 89 },
        { id: 'proj-003', name: 'Market Analysis', description: 'Market research data', itemCount: 234 },
      ];
      setProjects(mockProjects);
    } catch (err: any) {
      console.error(err);
    }
  }

  async function loadPlans() {
    setLoading(true);
    try {
      const data = await api.listCollectionPlans(projectId);
      setPlans(data);
      if (data.length > 0 && !selectedPlan) {
        setSelectedPlan(data[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadResults() {
    if (!selectedPlan) return;
    try {
      const data = await api.getCollectionResults(selectedPlan.id, projectId);
      setResults(data);
    } catch (err: any) {
      console.error(err);
    }
  }

  async function loadJobs() {
    if (!selectedPlan) return;
    try {
      const data = await api.getCollectionJobs(selectedPlan.id, projectId);
      setJobs(data);
    } catch (err: any) {
      console.error(err);
    }
  }

  async function handleCreatePlan() {
    if (!newQuestion) return;
    try {
      const plan = await api.createCollectionPlan({
        projectId,
        question: newQuestion,
        frequency: newFrequency,
      });
      setPlans([...plans, plan]);
      setSelectedPlan(plan);
      setShowNewPlan(false);
      setNewQuestion('');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleAddSource() {
    if (!selectedPlan || !newSourceUrl) return;
    try {
      await api.addSource(selectedPlan.id, projectId, {
        type: newSourceType,
        url: newSourceUrl,
        label: newSourceLabel || undefined,
      });
      loadPlans();
      setNewSourceUrl('');
      setNewSourceLabel('');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteSource(sourceId: string) {
    if (!selectedPlan) return;
    try {
      await api.deleteSource(selectedPlan.id, sourceId, projectId);
      loadPlans();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleAddKeyword() {
    if (!selectedPlan || !newKeyword) return;
    try {
      await api.addKeyword(selectedPlan.id, projectId, {
        word: newKeyword,
        type: newKeywordType,
      });
      loadPlans();
      setNewKeyword('');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteKeyword(keywordId: string) {
    if (!selectedPlan) return;
    try {
      await api.deleteKeyword(selectedPlan.id, keywordId, projectId);
      loadPlans();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleRunCollection() {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      await api.runCollection(selectedPlan.id, projectId);
      await loadResults();
      await loadJobs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePlan(id: string) {
    try {
      await api.deleteCollectionPlan(id, projectId);
      setPlans(plans.filter(p => p.id !== id));
      if (selectedPlan?.id === id) {
        setSelectedPlan(plans[0] || null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  function getWordCloudSize(value: number, max: number): string {
    const ratio = value / max;
    if (ratio > 0.7) return 'xl';
    if (ratio > 0.4) return 'lg';
    if (ratio > 0.2) return 'md';
    return 'sm';
  }

  function getWordCloudColor(index: number): string {
    return COLORS[index % COLORS.length];
  }

  function getJobStatusInfo(status: string) {
    switch (status) {
      case 'COMPLETED': return { icon: <CheckCircle className="w-4 h-4 text-green-500" />, color: 'text-green-600', bg: 'bg-green-50' };
      case 'FAILED': return { icon: <XCircle className="w-4 h-4 text-red-500" />, color: 'text-red-600', bg: 'bg-red-50' };
      case 'RUNNING': return { icon: <Clock className="w-4 h-4 text-yellow-500" />, color: 'text-yellow-600', bg: 'bg-yellow-50' };
      default: return { icon: <AlertCircle className="w-4 h-4 text-gray-500" />, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  }

  const maxWordValue = results?.wordCloud?.[0]?.value || 1;

  const topWords = useMemo(() => {
    if (!results?.wordCloud) return [];
    return [...results.wordCloud].sort((a, b) => b.value - a.value).slice(0, 20);
  }, [results?.wordCloud]);

  const sourceStats = useMemo(() => {
    if (!results?.items) return [];
    const stats: Record<string, number> = {};
    results.items.forEach(item => {
      stats[item.sourceType] = (stats[item.sourceType] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [results?.items]);

  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LayoutGrid className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-500" />
                Sentinel Intelligence
              </h1>
              <p className="text-xs text-slate-400">Data Collection & Analytics Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-slate-800 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button 
              onClick={loadPlans} 
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-slate-900/50 border-r border-slate-700 min-h-[calc(100vh-73px)] transition-all duration-300 overflow-hidden`}>
          <div className="p-4">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Current Project</h3>
              {projects.filter(p => p.id === projectId).map(p => (
                <div key={p.id} className="p-3 bg-blue-600/20 border border-blue-500/50 rounded-lg">
                  <p className="text-sm font-bold text-white">{p.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                  <p className="text-xs text-blue-400 mt-2">{p.itemCount} items</p>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collection Plans</h3>
                <button 
                  onClick={() => setShowNewPlan(!showNewPlan)}
                  className="p-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>

              {showNewPlan && (
                <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
                  <textarea
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    placeholder="What data do you want to collect?"
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                  <select
                    value={newFrequency}
                    onChange={e => setNewFrequency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="ON_DEMAND">On Demand</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                  <button 
                    onClick={handleCreatePlan} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Create Plan
                  </button>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-3 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No collection plans yet
                </div>
              ) : (
                <div className="space-y-2">
                  {plans.map(plan => (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`group p-3 rounded-lg cursor-pointer transition-all ${
                        selectedPlan?.id === plan.id 
                          ? 'bg-blue-600/20 border border-blue-500/50' 
                          : 'hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{plan.question}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{plan.frequency}</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-400">{plan.sources?.length || 0} sources</span>
                          </div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {selectedPlan ? (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{selectedPlan.question}</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                        {selectedPlan.frequency}
                      </span>
                      <span className="text-sm text-slate-400">
                        Last collected: {selectedPlan.lastCollectedAt 
                          ? new Date(selectedPlan.lastCollectedAt).toLocaleString() 
                          : 'Never'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleRunCollection}
                    disabled={loading || !selectedPlan.sources?.length}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Collecting...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Collection
                      </>
                    )}
                  </button>
                </div>

                <div className="flex gap-1 border-b border-slate-700">
                  {[
                    { id: 'details', label: 'Details' },
                    { id: 'results', label: 'Results', count: results?.total || 0 },
                    { id: 'jobs', label: 'Jobs', count: jobs.length },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                        activeTab === tab.id 
                          ? 'text-blue-400 border-blue-400' 
                          : 'text-slate-400 border-transparent hover:text-slate-300'
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className="ml-2 px-2 py-0.5 bg-slate-700 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'details' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      Sources (RSS / Web)
                    </h3>
                    <div className="flex gap-2 mb-4">
                      <select
                        value={newSourceType}
                        onChange={e => setNewSourceType(e.target.value)}
                        className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="RSS">RSS Feed</option>
                        <option value="WEB">Website</option>
                        <option value="PDF">PDF</option>
                      </select>
                      <input
                        type="text"
                        value={newSourceUrl}
                        onChange={e => setNewSourceUrl(e.target.value)}
                        placeholder={newSourceType === 'RSS' ? 'https://example.com/feed.xml' : 'https://example.com/page'}
                        className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button 
                        onClick={handleAddSource} 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {selectedPlan.sources?.map(source => (
                        <div key={source.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg group">
                          <div className="p-2 bg-slate-800 rounded-lg">
                            {source.type === 'RSS' && <Rss className="w-4 h-4 text-orange-400" />}
                            {source.type === 'WEB' && <Globe className="w-4 h-4 text-green-400" />}
                            {source.type === 'PDF' && <FileText className="w-4 h-4 text-red-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{source.label || source.url}</p>
                            <p className="text-xs text-slate-400 truncate">{source.url}</p>
                          </div>
                          <a 
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </a>
                          <button 
                            onClick={() => handleDeleteSource(source.id)}
                            className="p-2 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                      {(!selectedPlan.sources || selectedPlan.sources.length === 0) && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No sources added yet</p>
                          <p className="text-xs">Add RSS feeds or websites to collect data</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Filter className="w-5 h-5 text-purple-400" />
                      Keywords (Filter)
                    </h3>
                    <div className="flex gap-2 mb-4">
                      <select
                        value={newKeywordType}
                        onChange={e => setNewKeywordType(e.target.value as 'INCLUDE' | 'EXCLUDE')}
                        className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="INCLUDE">Include (+)</option>
                        <option value="EXCLUDE">Exclude (-)</option>
                      </select>
                      <input
                        type="text"
                        value={newKeyword}
                        onChange={e => setNewKeyword(e.target.value)}
                        placeholder="Enter keyword..."
                        className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        onKeyDown={e => e.key === 'Enter' && handleAddKeyword()}
                      />
                      <button 
                        onClick={handleAddKeyword} 
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlan.keywords?.map(kw => (
                        <span 
                          key={kw.id} 
                          className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                            kw.type === 'INCLUDE' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {kw.type === 'INCLUDE' ? '+' : '-'} {kw.word}
                          <button 
                            onClick={() => handleDeleteKeyword(kw.id)}
                            className="opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {(!selectedPlan.keywords || selectedPlan.keywords.length === 0) && (
                        <div className="text-center py-8 text-slate-500 text-sm w-full">
                          <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No keywords added yet</p>
                          <p className="text-xs">Filter content with keywords</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'results' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <Database className="w-6 h-6 text-blue-200" />
                        <TrendingUp className="w-5 h-5 text-blue-200" />
                      </div>
                      <p className="text-3xl font-bold">{results?.total || 0}</p>
                      <p className="text-sm text-blue-200">Items Collected</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <Hash className="w-6 h-6 text-purple-200" />
                        <Tag className="w-5 h-5 text-purple-200" />
                      </div>
                      <p className="text-3xl font-bold">{results?.wordCloud?.length || 0}</p>
                      <p className="text-sm text-purple-200">Unique Words</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <Globe className="w-6 h-6 text-green-200" />
                        <Link2 className="w-5 h-5 text-green-200" />
                      </div>
                      <p className="text-3xl font-bold">{selectedPlan.sources?.length || 0}</p>
                      <p className="text-sm text-green-200">Sources</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <Filter className="w-6 h-6 text-orange-200" />
                        <Search className="w-5 h-5 text-orange-200" />
                      </div>
                      <p className="text-3xl font-bold">{selectedPlan.keywords?.length || 0}</p>
                      <p className="text-sm text-orange-200">Keywords</p>
                    </div>
                  </div>

                  {topWords.length > 0 && (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-400" />
                          Word Cloud - Top Keywords
                        </h3>
                        <span className="text-xs text-slate-400">Size = Frequency</span>
                      </div>
                      <div className="flex flex-wrap justify-center items-center gap-4 min-h-[180px]">
                        {topWords.map((word, i) => {
                          const ratio = word.value / maxWordValue;
                          const fontSize = ratio > 0.7 ? 'text-5xl' : ratio > 0.4 ? 'text-3xl' : ratio > 0.2 ? 'text-xl' : 'text-base';
                          const opacity = 0.4 + (ratio * 0.6);
                          return (
                            <span 
                              key={i} 
                              style={{ 
                                color: getWordCloudColor(i),
                                fontSize,
                                opacity,
                                fontWeight: ratio > 0.5 ? 'bold' : 'normal'
                              }}
                              className="transition-all hover:scale-110 cursor-default"
                            >
                              {word.text}
                              <span className="text-xs opacity-60 ml-1">({word.value})</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(sourceStats.length > 0 || topWords.length > 0) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {sourceStats.length > 0 && (
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-blue-400" />
                            Source Distribution
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPie>
                                <Pie
                                  data={sourceStats}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                  label={({ name, value }) => `${name}: ${value}`}
                                >
                                  {sourceStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                              </RechartsPie>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex flex-wrap justify-center gap-4 mt-2">
                            {sourceStats.map((stat, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                <span className="text-sm text-slate-400">{stat.name}: {stat.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {topWords.length > 0 && (
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                            Top Keywords Stats
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={topWords.slice(0, 10)} layout="vertical">
                                <XAxis type="number" stroke="#64748b" fontSize={12} />
                                <YAxis dataKey="text" type="category" stroke="#64748b" fontSize={12} width={80} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                  labelStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-green-400" />
                        Collected Items
                      </h3>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'} max-h-[500px] overflow-y-auto`}>
                      {results?.items?.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`${viewMode === 'grid' ? 'p-4' : 'p-3'} bg-slate-900/50 rounded-lg hover:bg-slate-900 cursor-pointer transition-colors`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium text-white flex-1 line-clamp-2">{item.title || 'Untitled'}</h4>
                            <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded ml-2">
                              {item.sourceType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                            {item.description || item.contentRaw.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="truncate">{item.sourceUrl}</span>
                            <span>{new Date(item.fetchedAt).toLocaleDateString()}</span>
                          </div>
                          {item.matchedKeywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.matchedKeywords.slice(0, 5).map((kw, i) => (
                                <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {(!results?.items || results.items.length === 0) && (
                        <div className="text-center py-12 text-slate-500 col-span-2">
                          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No items collected yet</p>
                          <p className="text-sm">Run collection to gather data</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedItem && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
                      <div className="bg-slate-800 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-bold text-white">{selectedItem.title || 'Untitled'}</h3>
                          <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-700 rounded">
                            <XCircle className="w-5 h-5 text-slate-400" />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-xs text-slate-400">Source</span>
                            <p className="text-sm text-white">{selectedItem.sourceUrl}</p>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400">Type</span>
                            <p className="text-sm text-white">{selectedItem.sourceType}</p>
                          </div>
                          {selectedItem.description && (
                            <div>
                              <span className="text-xs text-slate-400">Description</span>
                              <p className="text-sm text-white">{selectedItem.description}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-xs text-slate-400">Content</span>
                            <p className="text-sm text-white whitespace-pre-wrap">{selectedItem.contentRaw}</p>
                          </div>
                          {selectedItem.matchedKeywords.length > 0 && (
                            <div>
                              <span className="text-xs text-slate-400">Matched Keywords</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedItem.matchedKeywords.map((kw, i) => (
                                  <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full">
                                    + {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-700">
                            <span>Fetched: {new Date(selectedItem.fetchedAt).toLocaleString()}</span>
                            <span>Created: {new Date(selectedItem.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'jobs' && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-yellow-400" />
                    Collection Jobs
                  </h3>
                  <div className="space-y-3">
                    {jobs.map(job => {
                      const statusInfo = getJobStatusInfo(job.status);
                      return (
                        <div key={job.id} className={`p-4 ${statusInfo.bg} rounded-lg`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {statusInfo.icon}
                              <div>
                                <p className={`font-medium ${statusInfo.color}`}>{job.status}</p>
                                <p className="text-xs text-slate-500">
                                  {job.triggeredBy} • {new Date(job.startedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-700">{job.itemsStored} stored</p>
                              <p className="text-xs text-slate-500">
                                {job.itemsCollected} collected • {job.itemsFiltered} filtered
                              </p>
                            </div>
                          </div>
                          {job.errorMessage && (
                            <p className="mt-2 text-sm text-red-500">{job.errorMessage}</p>
                          )}
                        </div>
                      );
                    })}
                    {jobs.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No collection jobs yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
              <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg mb-2">No plan selected</p>
              <p className="text-sm">Create a new collection plan to get started</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}