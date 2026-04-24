'use client';

import { useState } from 'react';
import { Plus, Trash2, Filter } from 'lucide-react';
import * as api from '../../lib/api';
import type { CollectionPlan } from '../../types';

interface Props {
  plan: CollectionPlan;
  projectId: string;
  onRefresh: () => void;
}

export default function KeywordManager({ plan, projectId, onRefresh }: Props) {
  const [word, setWord] = useState('');
  const [type, setType] = useState<'INCLUDE' | 'EXCLUDE'>('INCLUDE');

  async function handleAdd() {
    if (!word) return;
    try {
      await api.addKeyword(plan.id, projectId, { word, type });
      onRefresh();
      setWord('');
    } catch (err) { console.error(err); }
  }

  async function handleDelete(keywordId: string) {
    try {
      await api.deleteKeyword(plan.id, keywordId, projectId);
      onRefresh();
    } catch (err) { console.error(err); }
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Filter className="w-5 h-5 text-purple-400" /> Keywords
      </h3>
      <div className="flex gap-2 mb-4">
        <select value={type} onChange={e => setType(e.target.value as any)}
          className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm">
          <option value="INCLUDE">Include (+)</option>
          <option value="EXCLUDE">Exclude (-)</option>
        </select>
        <input value={word} onChange={e => setWord(e.target.value)}
          placeholder="Enter keyword..." className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
          onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <button onClick={handleAdd} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {plan.keywords?.map(kw => (
          <span key={kw.id} className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            kw.type === 'INCLUDE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {kw.type === 'INCLUDE' ? '+' : '-'} {kw.word}
            <button onClick={() => handleDelete(kw.id)} className="opacity-0 group-hover:opacity-100">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
        {(!plan.keywords || plan.keywords.length === 0) && (
          <div className="text-center py-8 text-slate-500 text-sm">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No keywords added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}