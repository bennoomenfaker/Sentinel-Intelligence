'use client';

import { Database, Hash, Globe, Filter, TrendingUp, Tag, Link2, Search } from 'lucide-react';
import type { CollectionResults, CollectionPlan } from '../../types';
import { Card, CardHeader, CardTitle, StatCard } from './ui/Card';
import { Badge } from './ui/Badge';

interface Props {
  results: CollectionResults;
  plan: CollectionPlan;
}

export default function StatsCards({ results, plan }: Props) {
  const getSourceStats = () => {
    const stats: Record<string, number> = {};
    plan.sources?.forEach(s => {
      stats[s.type] = (stats[s.type] || 0) + 1;
    });
    return Object.entries(stats).map(([key, val]) => `${val} ${key}`).join(' • ');
  };

  const stats = [
    {
      title: 'Items collectés',
      value: results.total || 0,
      icon: Database,
      gradient: 'from-blue-500 to-cyan-500',
      subtitle: `${results.items?.filter(i => i.sourceType === 'RSS').length || 0} RSS • ${results.items?.filter(i => i.sourceType === 'WEB').length || 0} Web • ${results.items?.filter(i => i.sourceType === 'PDF').length || 0} PDF`,
    },
    {
      title: 'Mots uniques',
      value: results.wordCloud?.length || 0,
      icon: Hash,
      gradient: 'from-purple-500 to-pink-500',
      subtitle: results.wordCloud?.[0] ? `${results.wordCloud[0].text} (${results.wordCloud[0].value})` : 'Aucun',
    },
    {
      title: 'Sources actives',
      value: plan.sources?.length || 0,
      icon: Globe,
      gradient: 'from-green-500 to-emerald-500',
      subtitle: getSourceStats() || 'Aucune source',
    },
    {
      title: 'Mots-clés',
      value: plan.keywords?.length || 0,
      icon: Filter,
      gradient: 'from-orange-500 to-amber-500',
      subtitle: `${plan.keywords?.filter(k => k.type === 'INCLUDE').length || 0} include • ${plan.keywords?.filter(k => k.type === 'EXCLUDE').length || 0} exclude`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-in">
      {stats.map((stat, i) => (
        <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
}
