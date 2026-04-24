'use client';

import { useState } from 'react';
import { Brain, Send, Smile, Frown, Meh, Hash, Building, Cpu } from 'lucide-react';
import * as api from '../../lib/api';

interface SentimentResult {
  score: number;
  label: string;
  confidence: number;
}

interface Entity {
  text: string;
  type: string;
  relevance: number;
}

interface ClassificationResult {
  category: string;
  confidence: number;
}

interface AiResult {
  sentiment: SentimentResult;
  entities: Entity[];
  classification: ClassificationResult;
}

export default function AiAnalyzer() {
  const [content, setContent] = useState('');
  const [result, setResult] = useState<AiResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!content) return;
    setLoading(true);
    try {
      const res = await api.analyzeWithAi(content);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getSentimentIcon(label: string) {
    switch (label) {
      case 'positive': return <Smile className="w-8 h-8 text-green-500" />;
      case 'negative': return <Frown className="w-8 h-8 text-red-500" />;
      default: return <Meh className="w-8 h-8 text-gray-500" />;
    }
  }

  function getEntityIcon(type: string) {
    switch (type) {
      case 'ORG': return <Building className="w-4 h-4" />;
      case 'TECHNOLOGY': return <Cpu className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  }

  const categoryColors: Record<string, string> = {
    technology: 'bg-blue-500',
    business: 'bg-green-500',
    AI: 'bg-purple-500',
    security: 'bg-red-500',
    health: 'bg-pink-500',
    science: 'bg-cyan-500',
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Content Analyzer
        </h3>
        
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste content to analyze..."
            rows={3}
            className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 text-sm resize-none"
          />
          <button
            onClick={analyze}
            disabled={loading || !content}
            className="px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Analyzing...' : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
            <h4 className="text-sm font-semibold text-slate-400 mb-3">Sentiment</h4>
            <div className="flex items-center gap-3">
              {getSentimentIcon(result.sentiment.label)}
              <div>
                <p className="text-2xl font-bold text-white capitalize">{result.sentiment.label}</p>
                <p className="text-xs text-slate-400">Score: {result.sentiment.score.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  result.sentiment.label === 'positive' ? 'bg-green-500' :
                  result.sentiment.label === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                }`}
                style={{ width: `${result.sentiment.confidence * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
            <h4 className="text-sm font-semibold text-slate-400 mb-3">Category</h4>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-lg ${categoryColors[result.classification.category] || 'bg-slate-600'}`}>
                <p className="text-xl font-bold text-white uppercase">{result.classification.category}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Confidence: {(result.classification.confidence * 100).toFixed(0)}%</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
            <h4 className="text-sm font-semibold text-slate-400 mb-3">Entities</h4>
            <div className="flex flex-wrap gap-2">
              {result.entities.slice(0, 5).map((entity, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-sm"
                >
                  {getEntityIcon(entity.type)}
                  <span className="text-white">{entity.text}</span>
                </span>
              ))}
              {result.entities.length === 0 && (
                <p className="text-slate-500 text-sm">No entities found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}