import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { dataColors } from '@/styles/theme';

interface LineChartProps<T> {
  data: T[];
  xKey: keyof T & string;
  yKeys: {
    key: keyof T & string;
    name: string;
    color?: string;
  }[];
  xFormatter?: (value: number) => string;
  yFormatter?: (value: number) => string;
  /** Reference lines for thresholds */
  referenceLines?: {
    y: number;
    label: string;
    color?: string;
  }[];
}

/**
 * Themed line chart for time series data
 */
export function LineChart<T extends object>({
  data,
  xKey,
  yKeys,
  xFormatter = (v) => v.toLocaleString(),
  yFormatter = (v) => v.toLocaleString(),
  referenceLines = [],
}: LineChartProps<T>) {
  const colors = [
    dataColors.nc33,
    dataColors.nc50,
    dataColors.validators,
    dataColors.stake,
    '#06B6D4',
    '#8B5CF6',
  ];

  // --- Interactive Zoom State ---
  const [xDomain, setXDomain] = React.useState<[number, number] | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [lastX, setLastX] = React.useState<number | null>(null);

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    if (data.length < 2) return;

    const currentMin = xDomain ? xDomain[0] : (data[0] as any)[xKey];
    const currentMax = xDomain ? xDomain[1] : (data[data.length - 1] as any)[xKey];
    const range = currentMax - currentMin;
    const ZOOM_SPEED = 0.1;
    const factor = e.deltaY < 0 ? (1 - ZOOM_SPEED) : (1 + ZOOM_SPEED);
    
    const newRange = range * factor;
    // Zoom towards center
    const maxData = (data[data.length - 1] as any)[xKey];
    const center = currentMin + (range / 2);
    
    let newMin = Math.max(0, center - (newRange / 2));
    let newMax = Math.min(maxData, center + (newRange / 2));
    
    if (newMax > newMin) {
        setXDomain([newMin, newMax]);
    }
  }, [xDomain, data, xKey]);

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setLastX(e.clientX);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || lastX === null || !xDomain) return;
      const deltaScreen = lastX - e.clientX;
      setLastX(e.clientX);

      const chartWidth = e.currentTarget.clientWidth;
      const domainWidth = xDomain[1] - xDomain[0];
      const scale = domainWidth / chartWidth;
      const shift = deltaScreen * scale * 2; 

      setXDomain(prev => {
          if (!prev) return null;
          const [min, max] = prev;
          const dataMax = (data[data.length - 1] as any)[xKey];
          
          let newMin = Math.max(0, min + shift);
          let newMax = Math.min(dataMax, max + shift);
          
          // Prevent panning past edges too much
          if (newMin <= 0) {
              newMax = max;
              newMin = 0;
          }
           if (newMax >= dataMax) {
              newMin = min;
              newMax = dataMax;
           }

          return [newMin, newMax];
      });
  };

  const handleMouseUp = () => { setIsDragging(false); setLastX(null); };
  const handleMouseLeave = () => { setIsDragging(false); setLastX(null); };

  // Ref for non-passive event listener
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
        handleWheel(e as unknown as React.WheelEvent);
    };

    // Attach non-passive listener to prevent page scroll
    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
        container.removeEventListener('wheel', onWheel);
    };
  }, [handleWheel]);

  return (
    <div 
        ref={containerRef}
        className="w-full h-full select-none"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
    >
        <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
            dataKey={xKey}
            type="number"
            domain={xDomain || ['dataMin', 'dataMax']}
            allowDataOverflow
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={xFormatter}
            />
            <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={yFormatter}
            width={40}
            />
            <Tooltip
            contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelFormatter={(label) => `Block ${xFormatter(Number(label))}`}
            formatter={(value: number | undefined, name: string | undefined) => {
                const safeValue = typeof value === 'number' ? value : 0;
                return [yFormatter(safeValue), name ?? ''];
            }}
            />
            <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            />
            {referenceLines.map((ref, idx) => (
            <ReferenceLine 
                key={idx}
                y={ref.y} 
                stroke={ref.color ?? '#EF4444'}
                strokeDasharray="5 5"
                label={{ 
                value: ref.label, 
                fill: ref.color ?? '#EF4444',
                fontSize: 12,
                position: 'right'
                }}
            />
            ))}
            {yKeys.map((item, idx) => (
            <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.name}
                stroke={item.color ?? colors[idx % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
            />
            ))}
        </RechartsLineChart>
        </ResponsiveContainer>
    </div>
  );
}
