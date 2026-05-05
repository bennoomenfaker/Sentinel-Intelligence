interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-surface-800/50 backdrop-blur-sm rounded-2xl border border-surface-700 
        p-6 transition-all duration-300
        ${hover ? 'hover:bg-surface-800/70 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, icon: Icon, color = 'text-primary-400' }: { 
  children: React.ReactNode; 
  icon?: any; 
  color?: string;
}) {
  return (
    <h3 className={`text-lg font-semibold text-white flex items-center gap-2 ${color}`}>
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </h3>
  );
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  gradient = 'from-primary-500 to-primary-600',
  subtitle,
  trend,
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  gradient?: string;
  subtitle?: any;
  trend?: { value: number; label: string };
}) {
  return (
    <Card hover className="relative overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <CardHeader>
        <div className="p-2 bg-surface-900/50 rounded-xl">
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className={`text-sm ${trend.value > 0 ? 'text-success' : 'text-danger'}`}>
            {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </CardHeader>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-surface-400">{title}</p>
      {subtitle && <p className="text-xs text-surface-500 mt-2">{String(subtitle)}</p>}
    </Card>
  );
}
