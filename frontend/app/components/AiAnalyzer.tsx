'use client';

import { useState } from 'react';
import { Brain, Send, Smile, Frown, Meh, Hash, Building, Cpu, Tag, TrendingUp } from 'lucide-react';
import * as api from '../../lib/api';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface SentimentResult {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
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

const categoryColors: Record<string, string> = {
  technology: 'bg-blue-500/20 text-blue-400',
  business: 'bg-green-500/20 text-green-400',
  AI: 'bg-purple-500/20 text-purple-400',
  security: 'bg-red-500/20 text-red-400',
  health: 'bg-pink-500/20 text-pink-400',
  science: 'bg-cyan-500/20 text-cyan-400',
};

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
      case 'positive': return <Smile className="w-10 h-10 text-green-400" />;
      case 'negative': return <Frown className="w-10 h-10 text-red-400" />;
      default: return <Meh className="w-10 h-10 text-surface-400" />;
    }
  }

  function getEntityIcon(type: string) {
    switch (type) {
      case 'ORG': return <Building className="w-4 h-4" />;
      case 'TECHNOLOGY': return <Cpu className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle icon={Brain} color="text-purple-400">
            Analyse IA de contenu
          </CardTitle>
        </CardHeader>

        <div className="flex gap-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Collez un contenu à analyser..."
            rows={4}
            className="flex-1 bg-surface-900 border border-surface-600 text-white rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-surface-500"
          />
          <Button 
            onClick={analyze}
            loading={loading}
            disabled={!content}
            className="self-end"
          >
            <Send className="w-4 h-4" />
            Analyser
          </Button>
        </div>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
            <div className="relative">
              <h4 className="text-sm font-semibold text-surface-400 mb-4">Sentiment</h4>
              <div className="flex items-center gap-4">
                {getSentimentIcon(result.sentiment.label)}
                <div>
                  <p className={`text-2xl font-bold capitalize ${
                    result.sentiment.label === 'positive' ? 'text-green-400' :
                    result.sentiment.label === 'negative' ? 'text-red-400' :
                    'text-surface-400'
                  }`}>
                    {result.sentiment.label}
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    Score: {result.sentiment.score.toFixed(2)} • Confiance: {(result.sentiment.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 bg-surface-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    result.sentiment.label === 'positive' ? 'bg-green-500' :
                    result.sentiment.label === 'negative' ? 'bg-red-500' :
                    'bg-surface-500'
                  }`}
                  style={{ width: `${result.sentiment.confidence * 100}%` }}
                />
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
            <div className="relative">
              <h4 className="text-sm font-semibold text-surface-400 mb-4">Catégorie</h4>
              <div className="flex items-center gap-3">
                <div className={`px-4 py-3 rounded-xl ${categoryColors[result.classification.category] || 'bg-surface-700/50'}`}>
                  <p className="text-lg font-bold uppercase">{result.classification.category}</p>
                </div>
              </div>
              <p className="text-xs text-surface-500 mt-3">
                Confiance: {(result.classification.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </Card>

          <Card>
            <h4 className="text-sm font-semibold text-surface-400 mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Entités détectées
            </h4>
            <div className="space-y-2">
              {result.entities.slice(0, 5).map((entity, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-2 bg-surface-900/50 rounded-lg animate-slide-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="p-1.5 bg-surface-700 rounded-lg">
                    {getEntityIcon(entity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{entity.text}</p>
                    <p className="text-xs text-surface-500">{entity.type}</p>
                  </div>
                  <Badge variant="info">{entity.relevance.toFixed(1)}</Badge>
                </div>
              ))}
              {result.entities.length === 0 && (
                <p className="text-sm text-surface-500 text-center py-4">Aucune entité détectée</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {!result && (
        <Card className="p-12 text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-surface-700" />
          <p className="text-surface-400 font-medium">Analysez du contenu avec l'IA</p>
          <p className="text-sm text-surface-500 mt-2">Collez du texte ci-dessus pour obtenir sentiment, catégorie et entités</p>
        </Card>
      )}
    </div>
  );
}
