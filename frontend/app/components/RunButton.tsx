'use client';

import { Play } from 'lucide-react';

interface Props {
  loading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function RunButton({ loading, onClick, disabled }: Props) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed">
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Collecting...
        </>
      ) : (
        <>
          <Play className="w-4 h-4" />
          Run Collection
        </>
      )}
    </button>
  );
}