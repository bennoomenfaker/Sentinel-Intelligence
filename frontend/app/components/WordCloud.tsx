'use client';

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import type { WordStat } from '../../types';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#ef4444'];

interface Props {
  wordCloud: WordStat[];
}

export default function WordCloud({ wordCloud }: Props) {
  const topWords = useMemo(() => [...wordCloud].sort((a, b) => b.value - a.value).slice(0, 20), [wordCloud]);
  const maxValue = wordCloud[0]?.value || 1;

  if (topWords.length === 0) return null;

  return (
    <div className="bg-surface-800/50 rounded-xl p-6 border border-surface-700 overflow-hidden w-full max-w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" /> Nuage de mots
        </h3>
        <span className="text-xs text-surface-400">Taille = Fréquence</span>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-4 min-h-[180px] max-w-full overflow-hidden">
        {topWords.map((word, i) => {
          const ratio = word.value / maxValue;
          const fontSize = ratio > 0.7 ? 'text-5xl' : ratio > 0.4 ? 'text-3xl' : ratio > 0.2 ? 'text-xl' : 'text-base';
          return (
            <span key={i} style={{ color: COLORS[i % COLORS.length], fontSize, opacity: 0.4 + ratio * 0.6 }}
              className="cursor-default hover:scale-110 transition-all">
              {word.text}<span className="text-xs opacity-60 ml-1">({word.value})</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}