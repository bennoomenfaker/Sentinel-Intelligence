'use client';

import { useState } from 'react';
import { Database, LayoutGrid, ChevronRight, XCircle } from 'lucide-react';
import type { RawItem } from '../../types';

interface Props {
  items: RawItem[];
  selectedItem: RawItem | null;
  onSelect: (item: RawItem) => void;
}

export default function ItemList({ items, selectedItem, onSelect }: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-green-400" /> Collected Items
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'} max-h-[500px] overflow-y-auto`}>
        {items.map(item => (
          <div key={item.id} onClick={() => onSelect(item)}
            className={`${viewMode === 'grid' ? 'p-4' : 'p-3'} bg-slate-900/50 rounded-lg hover:bg-slate-900 cursor-pointer`}>
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-white flex-1 line-clamp-2">{item.title || 'Untitled'}</h4>
              <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded ml-2">{item.sourceType}</span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{item.description || item.contentRaw.substring(0, 150)}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="truncate">{item.sourceUrl}</span>
              <span>{new Date(item.fetchedAt).toLocaleDateString()}</span>
            </div>
            {item.matchedKeywords?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.matchedKeywords.slice(0, 5).map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">{kw}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-12 text-slate-500 col-span-2">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No items collected yet</p>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => onSelect(null as any)}>
          <div className="bg-slate-800 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{selectedItem.title || 'Untitled'}</h3>
              <button onClick={() => onSelect(null as any)} className="p-2 hover:bg-slate-700 rounded">
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div><span className="text-xs text-slate-400">Source</span><p className="text-sm text-white">{selectedItem.sourceUrl}</p></div>
              <div><span className="text-xs text-slate-400">Type</span><p className="text-sm text-white">{selectedItem.sourceType}</p></div>
              <div><span className="text-xs text-slate-400">Content</span><p className="text-sm text-white whitespace-pre-wrap">{selectedItem.contentRaw}</p></div>
              {selectedItem.matchedKeywords?.length > 0 && (
                <div><span className="text-xs text-slate-400">Keywords</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedItem.matchedKeywords.map((kw, i) => (<span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">+ {kw}</span>))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}