'use client';

import { useState } from 'react';
import { Plus, Trash2, Globe, Rss, FileText, ExternalLink } from 'lucide-react';
import * as api from '../../lib/api';
import type { CollectionPlan } from '../../types';

interface Props {
  plan: CollectionPlan;
  projectId: string;
  onRefresh: () => void;
}

export default function SourceManager({ plan, projectId, onRefresh }: Props) {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('RSS');
  const [label, setLabel] = useState('');

  async function handleAdd() {
    if (!url) return;
    try {
      await api.addSource(plan.id, projectId, { type, url, label: label || undefined });
      onRefresh();
      setUrl('');
      setLabel('');
    } catch (err) { console.error(err); }
  }

  async function handleDelete(sourceId: string) {
    try {
      await api.deleteSource(plan.id, sourceId, projectId);
      onRefresh();
    } catch (err) { console.error(err); }
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5 text-blue-400" /> Sources (RSS / Web)
      </h3>
      <div className="flex gap-2 mb-4">
        <select value={type} onChange={e => setType(e.target.value)}
          className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm">
          <option value="RSS">RSS Feed</option>
          <option value="WEB">Website</option>
          <option value="PDF">PDF</option>
        </select>
        <input value={url} onChange={e => setUrl(e.target.value)}
          placeholder={type === 'RSS' ? 'https://example.com/feed.xml' : 'https://example.com/page'}
          className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm" />
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {plan.sources?.map(source => (
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
            <a href={source.url} target="_blank" rel="noopener" className="p-2 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100">
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
            <button onClick={() => handleDelete(source.id)} className="p-2 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
        {(!plan.sources || plan.sources.length === 0) && (
          <div className="text-center py-8 text-slate-500 text-sm">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No sources added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}