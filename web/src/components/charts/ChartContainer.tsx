import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  /** Height of the chart area */
  height?: number;
  /** Optional action buttons in header */
  actions?: ReactNode;
}

/**
 * Polished card wrapper for all charts
 */
export function ChartContainer({
  title,
  subtitle,
  children,
  className,
  height = 300,
  actions,
}: ChartContainerProps) {
  return (
    <div 
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden',
        'transition-all duration-200 hover:shadow-md',
        className
      )}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Chart Area */}
      <div 
        className="p-5 bg-slate-50/50"
        style={{ height }}
      >
        {children}
      </div>
    </div>
  );
}
