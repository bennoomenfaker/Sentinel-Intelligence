'use client';

import { useState } from 'react';
import { Plus, Trash2, Globe, Rss, FileText, ExternalLink, Link2 } from 'lucide-react';
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

export default function SourceManager({ plan, projectId, onRefresh }: Props) {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('RSS');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const typeConfig = {
    RSS: { icon: Rss, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    WEB: { icon: Globe, color: 'text-green-400', bg: 'bg-green-500/20' },
    PDF: { icon: FileText, color: 'text-red-400', bg: 'bg-red-500/20' },
  };

  async function handleAdd() {
    if (!url) return;
    setLoading(true);
    try {
      const newSource = await api.addSource(plan.id, projectId, { type, url, label: label || undefined });
      const updatedPlan = { 
        ...plan, 
        sources: [...(plan.sources || []), newSource] 
      };
      onRefresh(updatedPlan);
      setUrl('');
      setLabel('');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleDelete(sourceId: string) {
    try {
      await api.deleteSource(plan.id, sourceId, projectId);
      const updatedPlan = { 
        ...plan, 
        sources: plan.sources?.filter(s => s.id !== sourceId) || [] 
      };
      onRefresh(updatedPlan);
    } catch (err) { console.error(err); }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle icon={Link2} color="text-blue-400">Sources</CardTitle>
        <Badge>{plan.sources?.length || 0} actives</Badge>
      </CardHeader>

      <div className="flex flex-wrap gap-2 mb-4">
        <select 
          value={type} 
          onChange={e => setType(e.target.value)}
          className="bg-surface-900 border border-surface-600 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-w-[140px]"
        >
          <option value="RSS">📰 RSS Feed</option>
          <option value="WEB">🌐 Website</option>
          <option value="PDF">📄 PDF</option>
        </select>
        <input 
          value={url} 
          onChange={e => setUrl(e.target.value)}
          placeholder={type === 'RSS' ? 'https://exemple.com/feed.xml' : 'https://exemple.com'}
          className="flex-1 min-w-[200px] bg-surface-900 border border-surface-600 text-white rounded-xl px-4 py-2 text-sm placeholder-surface-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
        <Button onClick={handleAdd} loading={loading} icon={Plus} className="whitespace-nowrap">
          Ajouter
        </Button>
      </div>

      {label === '' && (
        <input 
          value={label} 
          onChange={e => setLabel(e.target.value)}
          placeholder="Label (optionnel)"
          className="w-full mb-4 bg-surface-900/50 border border-surface-600 text-white rounded-lg px-4 py-2 text-sm placeholder-surface-500"
        />
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {plan.sources?.map((source, index) => {
          const config = typeConfig[source.type] || typeConfig.RSS;
          const Icon = config.icon;
          
          return (
            <div 
              key={source.id}
              className="group flex items-center gap-3 p-4 bg-surface-900/50 rounded-xl hover:bg-surface-900 transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`p-2.5 ${config.bg} rounded-xl`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{source.label || new URL(source.url).hostname}</p>
                <p className="text-xs text-surface-400 truncate">{source.url}</p>
              </div>
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener"
                className="p-2 hover:bg-surface-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4 text-surface-400" />
              </a>
              <button 
                onClick={() => handleDelete(source.id)}
                className="p-2 hover:bg-danger/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4 text-danger" />
              </button>
            </div>
          );
        })}

        {(!plan.sources || plan.sources.length === 0) && (
          <div className="text-center py-12 text-surface-500">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aucune source</p>
            <p className="text-xs mt-1">Ajoutez une source pour commencer</p>
          </div>
        )}
      </div>
    </Card>
  );
}
