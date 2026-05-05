'use client';

import { Activity, CheckCircle, XCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import type { CollectionJob } from '../../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Badge, StatusBadge } from './ui/Badge';

interface Props {
  jobs: CollectionJob[];
}

export default function JobHistory({ jobs }: Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'FAILED': return <XCircle className="w-5 h-5 text-danger" />;
      case 'RUNNING': return <Clock className="w-5 h-5 text-warning animate-pulse" />;
      default: return <AlertCircle className="w-5 h-5 text-surface-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle icon={Activity} color="text-yellow-400">Historique des collectes</CardTitle>
        <Badge>{jobs.length} jobs</Badge>
      </CardHeader>

      <div className="space-y-3">
        {jobs.map((job, index) => (
          <div 
            key={job.id} 
            className="p-4 bg-surface-900/50 rounded-xl hover:bg-surface-900 transition-all duration-200 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(job.status)}
                <div>
                  <StatusBadge status={job.status} />
                  <p className="text-xs text-surface-500 mt-1">
                    {job.triggeredBy} • {new Date(job.startedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {job.completedAt && (
                <span className="text-xs text-surface-500">
                  {new Date(job.completedAt).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-surface-800/50 rounded-lg">
                <p className="text-lg font-bold text-white">{job.itemsCollected || 0}</p>
                <p className="text-xs text-surface-500">Collectés</p>
              </div>
              <div className="text-center p-2 bg-surface-800/50 rounded-lg">
                <p className="text-lg font-bold text-green-400">{job.itemsStored || 0}</p>
                <p className="text-xs text-surface-500">Stockés</p>
              </div>
              <div className="text-center p-2 bg-surface-800/50 rounded-lg">
                <p className="text-lg font-bold text-orange-400">{job.itemsFiltered || 0}</p>
                <p className="text-xs text-surface-500">Filtrés</p>
              </div>
            </div>

            {job.errorMessage && (
              <div className="mt-3 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                <p className="text-sm text-danger">{job.errorMessage}</p>
              </div>
            )}
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-12 text-surface-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Aucun job</p>
            <p className="text-xs mt-1">Lancez une collecte pour voir l'historique</p>
          </div>
        )}
      </div>
    </Card>
  );
}
