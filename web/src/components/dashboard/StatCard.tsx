import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  default: 'bg-white border-slate-200',
  primary: 'bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white',
  success: 'bg-gradient-to-br from-green-500 to-emerald-600 border-transparent text-white',
  warning: 'bg-gradient-to-br from-amber-400 to-orange-500 border-transparent text-white',
};

export function StatCard({
  label,
  value,
  unit,
  change,
  changeLabel = 'from start',
  variant = 'default',
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNeutral = change === undefined;
  const isPrimary = variant !== 'default';
  
  return (
    <div 
      className={cn(
        'rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md',
        variantStyles[variant],
        className
      )}
    >
      <p className={cn(
        'text-sm font-medium mb-2',
        isPrimary ? 'text-white/80' : 'text-slate-500'
      )}>
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className={cn(
          'text-3xl font-bold tracking-tight',
          isPrimary ? 'text-white' : 'text-slate-900'
        )}>
          {value}
        </span>
        {unit && (
          <span className={cn(
            'text-sm',
            isPrimary ? 'text-white/70' : 'text-slate-400'
          )}>
            {unit}
          </span>
        )}
      </div>
      {!isNeutral && (
        <div className="flex items-center gap-1.5 mt-3">
          {isPositive ? (
            <div className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
              isPrimary ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
            )}>
              <TrendingUp className="h-3 w-3" />
              +{change?.toFixed(1)}%
            </div>
          ) : (
            <div className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
              isPrimary ? 'bg-white/20 text-white' : 'bg-red-50 text-red-700'
            )}>
              <TrendingDown className="h-3 w-3" />
              {change?.toFixed(1)}%
            </div>
          )}
          <span className={cn(
            'text-xs',
            isPrimary ? 'text-white/60' : 'text-slate-400'
          )}>
            {changeLabel}
          </span>
        </div>
      )}
    </div>
  );
}
