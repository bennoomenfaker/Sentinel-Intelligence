'use client';

import { Database, Hash, Globe, Filter, TrendingUp, Tag, Link2, Search } from 'lucide-react';
import type { CollectionResults, CollectionPlan } from '../../types';

interface Props {
  results: CollectionResults;
  plan: CollectionPlan;
}

export default function StatsCards({ results, plan }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-2">
          <Database className="w-6 h-6 text-blue-200" />
          <TrendingUp className="w-5 h-5 text-blue-200" />
        </div>
        <p className="text-3xl font-bold">{results.total || 0}</p>
        <p className="text-sm text-blue-200">Items Collected</p>
      </div>
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-2">
          <Hash className="w-6 h-6 text-purple-200" />
          <Tag className="w-5 h-5 text-purple-200" />
        </div>
        <p className="text-3xl font-bold">{results.wordCloud?.length || 0}</p>
        <p className="text-sm text-purple-200">Unique Words</p>
      </div>
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-2">
          <Globe className="w-6 h-6 text-green-200" />
          <Link2 className="w-5 h-5 text-green-200" />
        </div>
        <p className="text-3xl font-bold">{plan.sources?.length || 0}</p>
        <p className="text-sm text-green-200">Sources</p>
      </div>
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-2">
          <Filter className="w-6 h-6 text-orange-200" />
          <Search className="w-5 h-5 text-orange-200" />
        </div>
        <p className="text-3xl font-bold">{plan.keywords?.length || 0}</p>
        <p className="text-sm text-orange-200">Keywords</p>
      </div>
    </div>
  );
}