interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

const variants = {
  default: 'bg-surface-700 text-surface-300',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-danger/20 text-danger',
  info: 'bg-info/20 text-info',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config = {
    'RUNNING': { variant: 'warning' as const, label: 'En cours' },
    'COMPLETED': { variant: 'success' as const, label: 'Terminé' },
    'FAILED': { variant: 'danger' as const, label: 'Échoué' },
    'PENDING': { variant: 'info' as const, label: 'En attente' },
  };
  
  const { variant, label } = config[status] || { variant: 'default' as const, label: status };
  return <Badge variant={variant}>{label}</Badge>;
}
