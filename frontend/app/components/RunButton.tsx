'use client';

import { Play, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  loading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function RunButton({ loading, onClick, disabled }: Props) {
  return (
    <Button
      onClick={onClick}
      disabled={loading || disabled}
      loading={loading}
      variant="primary"
      size="lg"
      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25"
    >
      {!loading && <Play className="w-4 h-4" />}
      {loading ? 'Collecte en cours...' : 'Lancer la collecte'}
    </Button>
  );
}
