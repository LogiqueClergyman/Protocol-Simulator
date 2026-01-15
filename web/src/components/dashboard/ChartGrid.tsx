import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Flexible grid for arranging charts with different sizes
 * Uses CSS Grid with 12 columns for flexibility
 */
export function ChartGrid({ children, className }: ChartGridProps) {
  return (
    <div 
      className={cn(
        'grid grid-cols-12 gap-6',
        className
      )}
    >
      {children}
    </div>
  );
}

interface ChartGridItemProps {
  children: ReactNode;
  /** Number of columns to span (1-12) */
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Number of rows to span */
  rowSpan?: 1 | 2;
  className?: string;
}

const colSpanClasses = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
};

const rowSpanClasses = {
  1: 'row-span-1',
  2: 'row-span-2',
};

export function ChartGridItem({ 
  children, 
  colSpan = 6, 
  rowSpan = 1,
  className 
}: ChartGridItemProps) {
  return (
    <div 
      className={cn(
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        className
      )}
    >
      {children}
    </div>
  );
}

ChartGrid.Item = ChartGridItem;
