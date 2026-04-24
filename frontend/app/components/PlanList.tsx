'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CollectionPlan } from '../../types';

interface Props {
  plans: CollectionPlan[];
  selectedPlan: CollectionPlan | null;
  loading: boolean;
  onSelect: (plan: CollectionPlan) => void;
  onDelete: (id: string) => void;
  onCreate: (question: string, frequency: string) => void;
}

export default function PlanList({ plans, selectedPlan, loading, onSelect, onDelete, onCreate }: Props) {
  const [showNew, setShowNew] = useState(false);
  const [question, setQuestion] = useState('');
  const [frequency, setFrequency] = useState('ON_DEMAND');

  function handleCreate() {
    onCreate(question, frequency);
    setShowNew(false);
    setQuestion('');
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase">Collection Plans</h3>
        <button onClick={() => setShowNew(!showNew)} className="p-1 bg-blue-600 hover:bg-blue-700 rounded">
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>

      {showNew && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
          <textarea value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="What data do you want to collect?" rows={2}
            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm resize-none" />
          <select value={frequency} onChange={e => setFrequency(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm">
            <option value="ON_DEMAND">On Demand</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
          <button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-sm">
            Create Plan
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-8 h-8 border-3 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div></div>
      ) : plans.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">No collection plans yet</div>
      ) : (
        <div className="space-y-2">
          {plans.map(plan => (
            <div key={plan.id} onClick={() => onSelect(plan)}
              className={`group p-3 rounded-lg cursor-pointer ${selectedPlan?.id === plan.id ? 'bg-blue-600/20 border border-blue-500/50' : 'hover:bg-slate-800 border border-transparent'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{plan.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{plan.frequency}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{plan.sources?.length || 0} sources</span>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); onDelete(plan.id); }} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}