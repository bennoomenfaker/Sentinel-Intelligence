'use client';

import { Activity, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { CollectionJob } from '../../types';

interface Props {
  jobs: CollectionJob[];
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'COMPLETED': return { icon: <CheckCircle className="w-4 h-4 text-green-500" />, color: 'text-green-600', bg: 'bg-green-50' };
    case 'FAILED': return { icon: <XCircle className="w-4 h-4 text-red-500" />, color: 'text-red-600', bg: 'bg-red-50' };
    case 'RUNNING': return { icon: <Clock className="w-4 h-4 text-yellow-500" />, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    default: return { icon: <AlertCircle className="w-4 h-4 text-gray-500" />, color: 'text-gray-600', bg: 'bg-gray-50' };
  }
}

export default function JobHistory({ jobs }: Props) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-yellow-400" /> Collection Jobs
      </h3>
      <div className="space-y-3">
        {jobs.map(job => {
          const statusInfo = getStatusInfo(job.status);
          return (
            <div key={job.id} className={`p-4 ${statusInfo.bg} rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusInfo.icon}
                  <div>
                    <p className={`font-medium ${statusInfo.color}`}>{job.status}</p>
                    <p className="text-xs text-slate-500">{job.triggeredBy} • {new Date(job.startedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">{job.itemsStored} stored</p>
                  <p className="text-xs text-slate-500">{job.itemsCollected} collected • {job.itemsFiltered} filtered</p>
                </div>
              </div>
              {job.errorMessage && <p className="mt-2 text-sm text-red-500">{job.errorMessage}</p>}
            </div>
          );
        })}
        {jobs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No collection jobs yet</p>
          </div>
        )}
      </div>
    </div>
  );
}