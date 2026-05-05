'use client';

import { useState } from 'react';
import { Database, LayoutGrid, List, XCircle, Globe, Rss, FileText, ExternalLink, Hash, Clock } from 'lucide-react';
import type { RawItem } from '../../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface Props {
  items: RawItem[];
  selectedItem: RawItem | null;
  onSelect: (item: RawItem | null) => void;
}

export default function ItemList({ items, selectedItem, onSelect }: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'RSS': return <Rss className="w-4 h-4 text-orange-400" />;
      case 'WEB': return <Globe className="w-4 h-4 text-green-400" />;
      case 'PDF': return <FileText className="w-4 h-4 text-red-400" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle icon={Database} color="text-green-400">
            Items collectés
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="p-2"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="p-2"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'} max-h-[600px] overflow-y-auto custom-scrollbar pr-2 w-full max-w-full`}>
          {items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`p-4 bg-surface-900/50 rounded-xl hover:bg-surface-900 cursor-pointer transition-all duration-200 border border-transparent hover:border-primary-500/30 animate-slide-up`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-white flex-1 line-clamp-2 flex items-center gap-2">
                  {getSourceIcon(item.sourceType)}
                  {item.title || 'Sans titre'}
                </h4>
                <Badge variant="info">{item.sourceType}</Badge>
              </div>
              
              <p className="text-xs text-surface-400 line-clamp-2 mb-3">
                {item.description || item.contentRaw?.substring(0, 150)}
              </p>
              
              <div className="flex items-center justify-between text-xs text-surface-500">
                <span className="truncate flex-1">{item.sourceUrl}</span>
                {item.publishedAt && (
                  <span className="flex items-center gap-1 ml-2">
                    <Clock className="w-3 h-3" />
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {item.matchedKeywords?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.matchedKeywords.slice(0, 3).map((kw, i) => (
                    <Badge key={i} variant="success">+ {kw}</Badge>
                  ))}
                  {item.matchedKeywords.length > 3 && (
                    <Badge variant="default">+{item.matchedKeywords.length - 3}</Badge>
                  )}
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-12 text-surface-500 col-span-2">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Aucun item collecté</p>
              <p className="text-xs mt-1">Lancez une collecte pour voir les résultats</p>
            </div>
          )}
        </div>
      </Card>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => onSelect(null)}>
          <div 
            className="bg-surface-800 rounded-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 'calc(100vw - 2rem)' }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{selectedItem.title || 'Sans titre'}</h3>
                <div className="flex items-center gap-2">
                  {getSourceIcon(selectedItem.sourceType)}
                  <a 
                    href={selectedItem.sourceUrl} 
                    target="_blank" 
                    rel="noopener"
                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    {selectedItem.sourceUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <Button variant="ghost" onClick={() => onSelect(null)} className="p-2">
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-surface-900/50 rounded-xl">
                  <p className="text-xs text-surface-400">Type</p>
                  <p className="text-sm font-medium text-white mt-1">{selectedItem.sourceType}</p>
                </div>
                {selectedItem.publishedAt && (
                  <div className="p-3 bg-surface-900/50 rounded-xl">
                    <p className="text-xs text-surface-400">Publié le</p>
                    <p className="text-sm font-medium text-white mt-1">
                      {new Date(selectedItem.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="p-3 bg-surface-900/50 rounded-xl">
                  <p className="text-xs text-surface-400">Mots-clés</p>
                  <p className="text-sm font-medium text-white mt-1">{selectedItem.matchedKeywords?.length || 0}</p>
                </div>
              </div>

              {selectedItem.aiAnalysis && (
                <div className="p-4 bg-surface-900/50 rounded-xl">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-purple-400" />
                    Analyse IA
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-surface-400">Sentiment</p>
                      <p className="text-sm text-white capitalize">{selectedItem.aiAnalysis.sentiment?.label || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-surface-400">Catégorie</p>
                      <p className="text-sm text-white">{selectedItem.aiAnalysis.classification?.category || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-surface-400">Entités</p>
                      <p className="text-sm text-white">{selectedItem.aiAnalysis.entities?.length || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-surface-400 mb-2">CONTENU</p>
                <div className="p-4 bg-surface-900/50 rounded-xl max-h-60 overflow-y-auto">
                  <p className="text-sm text-surface-300 whitespace-pre-wrap">{selectedItem.contentRaw}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
