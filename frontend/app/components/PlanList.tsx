'use client';

import { useState } from 'react';
import { Plus, Trash2, Activity, Clock, Calendar } from 'lucide-react';
import type { CollectionPlan } from '../../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

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
    if (!question) return;
    onCreate(question, frequency);
    setShowNew(false);
    setQuestion('');
  }

  const frequencyLabels = {
    'ON_DEMAND': 'Sur demande',
    'DAILY': 'Quotidien',
    'WEEKLY': 'Hebdomadaire',
    'MONTHLY': 'Mensuel',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Plans de collecte</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowNew(!showNew)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {showNew && (
        <Card className="p-4 space-y-3 animate-slide-up">
          <textarea 
            value={question} 
            onChange={e => setQuestion(e.target.value)}
            placeholder="Quelle donnée souhaitez-vous collecter ?"
            rows={3}
            className="w-full bg-surface-900 border border-surface-600 text-white rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-surface-500"
          />
          <select 
            value={frequency} 
            onChange={e => setFrequency(e.target.value)}
            className="w-full bg-surface-900 border border-surface-600 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="ON_DEMAND">📅 Sur demande</option>
            <option value="DAILY">📆 Quotidien</option>
            <option value="WEEKLY">📅 Hebdomadaire</option>
            <option value="MONTHLY">📆 Mensuel</option>
          </select>
          <Button onClick={handleCreate} disabled={!question} className="w-full">
            <Plus className="w-4 h-4" />
            Créer le plan
          </Button>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-3 border-surface-600 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-8 text-surface-500">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucun plan créé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map((plan, index) => (
            <div 
              key={plan.id} 
              onClick={() => onSelect(plan)}
              className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 animate-slide-up ${
                selectedPlan?.id === plan.id 
                  ? 'bg-primary-500/10 border-2 border-primary-500/50' 
                  : 'bg-surface-800/50 border-2 border-transparent hover:bg-surface-800 hover:border-surface-700'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{plan.question}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="info">
                      {frequencyLabels[plan.frequency] || plan.frequency}
                    </Badge>
                    <span className="text-xs text-surface-500">
                      {plan.sources?.length || 0} sources
                    </span>
                  </div>
                  {plan.lastCollectedAt && (
                    <p className="text-xs text-surface-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(plan.lastCollectedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(plan.id); }}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-danger/20 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4 text-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
