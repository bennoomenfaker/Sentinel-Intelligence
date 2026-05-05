'use client';

import { useState } from 'react';
import { Plus, Trash2, Filter, X, Check } from 'lucide-react';
import * as api from '../../lib/api';
import type { CollectionPlan } from '../../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface Props {
  plan: CollectionPlan;
  projectId: string;
  onRefresh: (updatedPlan?: any) => void;
}

export default function KeywordManager({ plan, projectId, onRefresh }: Props) {
  const [word, setWord] = useState('');
  const [type, setType] = useState<'INCLUDE' | 'EXCLUDE'>('INCLUDE');
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!word) return;
    setLoading(true);
    try {
      const newKeyword = await api.addKeyword(plan.id, projectId, { word, type });
      const updatedPlan = { 
        ...plan, 
        keywords: [...(plan.keywords || []), newKeyword] 
      };
      onRefresh(updatedPlan);
      setWord('');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleDelete(keywordId: string) {
    try {
      await api.deleteKeyword(plan.id, keywordId, projectId);
      const updatedPlan = { 
        ...plan, 
        keywords: plan.keywords?.filter(k => k.id !== keywordId) || [] 
      };
      onRefresh(updatedPlan);
    } catch (err) { console.error(err); }
  }

  const includeKeywords = plan.keywords?.filter(k => k.type === 'INCLUDE') || [];
  const excludeKeywords = plan.keywords?.filter(k => k.type === 'EXCLUDE') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle icon={Filter} color="text-purple-400">Mots-clés</CardTitle>
        <div className="flex gap-2">
          <Badge variant="success">{includeKeywords.length} include</Badge>
          <Badge variant="danger">{excludeKeywords.length} exclude</Badge>
        </div>
      </CardHeader>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex rounded-xl overflow-hidden border border-surface-600">
          <button
            onClick={() => setType('INCLUDE')}
            className={`px-3 py-2 text-sm font-medium transition-all whitespace-nowrap ${
              type === 'INCLUDE' 
                ? 'bg-success/20 text-success' 
                : 'bg-surface-900 text-surface-400 hover:text-white'
            }`}
          >
            <Check className="w-4 h-4 inline mr-1" />
            Include
          </button>
          <button
            onClick={() => setType('EXCLUDE')}
            className={`px-3 py-2 text-sm font-medium transition-all whitespace-nowrap ${
              type === 'EXCLUDE' 
                ? 'bg-danger/20 text-danger' 
                : 'bg-surface-900 text-surface-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4 inline mr-1" />
            Exclude
          </button>
        </div>
        <input 
          value={word} 
          onChange={e => setWord(e.target.value)}
          placeholder="Ajouter un mot-clé..."
          className="flex-1 min-w-[200px] bg-surface-900 border border-surface-600 text-white rounded-xl px-4 py-2 text-sm placeholder-surface-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} loading={loading} icon={Plus} size="sm" className="whitespace-nowrap">
          Ajouter
        </Button>
      </div>

      <div className="space-y-3">
        {includeKeywords.length > 0 && (
          <div>
            <p className="text-xs text-surface-400 mb-2 font-medium">INCLUDE</p>
            <div className="flex flex-wrap gap-2">
              {includeKeywords.map((kw, index) => (
                <span 
                  key={kw.id}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-success/10 text-success rounded-full text-xs border border-success/20 hover:bg-success/20 transition-all animate-slide-up max-w-full truncate"
                  style={{ animationDelay: `${index * 30}ms` }}
                  title={kw.word}
                >
                  <span className="truncate">+ {kw.word}</span>
                  <button 
                    onClick={() => handleDelete(kw.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {excludeKeywords.length > 0 && (
          <div>
            <p className="text-xs text-surface-400 mb-2 font-medium">EXCLUDE</p>
            <div className="flex flex-wrap gap-2">
              {excludeKeywords.map((kw, index) => (
                <span 
                  key={kw.id}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-danger/10 text-danger rounded-full text-xs border border-danger/20 hover:bg-danger/20 transition-all animate-slide-up max-w-full truncate"
                  style={{ animationDelay: `${index * 30}ms` }}
                  title={kw.word}
                >
                  <span className="truncate">- {kw.word}</span>
                  <button 
                    onClick={() => handleDelete(kw.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {(!plan.keywords || plan.keywords.length === 0) && (
          <div className="text-center py-12 text-surface-500">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Aucun mot-clé</p>
            <p className="text-xs mt-1">Ajoutez des mots-clés pour filtrer le contenu</p>
          </div>
        )}
      </div>
    </Card>
  );
}
