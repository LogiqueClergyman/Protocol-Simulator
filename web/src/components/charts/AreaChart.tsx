import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart as RechartsAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend,
} from 'recharts';
import { dataColors } from '@/styles/theme';

interface AreaChartProps<T> {
  data: T[];
  xKey: keyof T & string;
  yKeys: {
    key: keyof T & string;
    name: string;
    color?: string;
    yAxisId?: string;
  }[];
  xFormatter?: (value: number) => string;
  yFormatter?: (value: number) => string;
  rightYFormatter?: (value: number) => string;
}

/**
 * Themed area chart with gradient fills
 */
export function AreaChart<T extends object>({
  data,
  xKey,
  yKeys,
  xFormatter = (v) => v.toLocaleString(),
  yFormatter = (v) => v.toLocaleString(),
  rightYFormatter = (v) => v.toLocaleString(),
}: AreaChartProps<T>) {
  const colors = [
    dataColors.validators,
    dataColors.stake,
    dataColors.nc33,
    dataColors.nc50,
    '#06B6D4',
    '#8B5CF6',
  ];

  const hasRightAxis = yKeys.some(k => k.yAxisId === 'right');

  // --- Interactive Zoom State ---
  // Using explicit domain for XAxis to control zoom
  // Defaults to null (auto) until user interacts
  const [xDomain, setXDomain] = React.useState<[number, number] | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [lastX, setLastX] = React.useState<number | null>(null);

  // Handlers
  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop page scroll
    
    if (data.length < 2) return;

    // Get current domain or default to data range
    const currentMin = xDomain ? xDomain[0] : (data[0] as any)[xKey];
    const currentMax = xDomain ? xDomain[1] : (data[data.length - 1] as any)[xKey];
    const range = currentMax - currentMin;

    // Scale factor: SCROLL UP (negative delta) = ZOOM IN (smaller factor)
    const ZOOM_SPEED = 0.1;
    const factor = e.deltaY < 0 ? (1 - ZOOM_SPEED) : (1 + ZOOM_SPEED);
    
    // Calculate new range
    const newRange = range * factor;
    
    // Zoom towards center
    const newMin = Math.max(0, currentMin + (range - newRange) / 2);
    // Use data max as hard cap if needed, or let it float? 
    // Hard cap at data max to prevent zooming into future
    const dataMax = (data[data.length - 1] as any)[xKey];
    const newMax = Math.min(dataMax, currentMax - (range - newRange) / 2);

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

      // Convert screen delta to domain delta
      // Roughly: (domainWidth / screenWidth) * deltaScreen
      // ResponsiveContainer width is 100%, assume ~element width
      const chartWidth = e.currentTarget.clientWidth;
      const domainWidth = xDomain[1] - xDomain[0];
      const scale = domainWidth / chartWidth;
      
      const shift = deltaScreen * scale * 2; // *2 for sensitivity

      setXDomain(prev => {
          if (!prev) return null;
          const [min, max] = prev;
          const dataMin = (data[0] as any)[xKey];
          const dataMax = (data[data.length - 1] as any)[xKey];
          
          let newMin = min + shift;
          let newMax = max + shift;
          
          // Clamp
          if (newMin < dataMin) {
              newMin = dataMin;
              newMax = min + (newMax - newMin); // Maintain window size
          }
          if (newMax > dataMax) {
              newMax = dataMax;
              newMin = max - (newMax - newMin);
          }
          
          return [newMin, newMax];
      });
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      setLastX(null);
  };

  const handleMouseLeave = () => {
      setIsDragging(false);
      setLastX(null);
  };

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
        <RechartsAreaChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
            <defs>
            {yKeys.map((item, idx) => (
                <linearGradient 
                key={item.key} 
                id={`gradient-${item.key}`} 
                x1="0" y1="0" x2="0" y2="1"
                >
                <stop 
                    offset="5%" 
                    stopColor={item.color ?? colors[idx % colors.length]} 
                    stopOpacity={0.3}
                />
                <stop 
                    offset="95%" 
                    stopColor={item.color ?? colors[idx % colors.length]} 
                    stopOpacity={0}
                />
                </linearGradient>
            ))}
            </defs>
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
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={yFormatter}
            width={45}
            />
            {hasRightAxis && (
            <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={rightYFormatter}
                width={45}
            />
            )}
            <Tooltip
            contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelFormatter={(label) => `Block ${xFormatter(Number(label))}`}
            formatter={(value: number | undefined, name: string | undefined, props: { yAxisId?: string; payload?: { yAxisId?: string } } | undefined) => {
                const axisId = props?.payload?.yAxisId ?? props?.yAxisId; 
                const formatter = axisId === 'right' ? rightYFormatter : yFormatter;
                const safeValue = typeof value === 'number' ? value : 0;
                return [formatter(safeValue), name ?? ''];
            }}
            />
            <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            />
            {yKeys.map((item, idx) => (
            <Area
                key={item.key}
                yAxisId={item.yAxisId ?? 'left'}
                type="monotone"
                dataKey={item.key}
                name={item.name}
                stroke={item.color ?? colors[idx % colors.length]}
                fill={`url(#gradient-${item.key})`}
                strokeWidth={2}
                isAnimationActive={false} // Disable animation for performance during drag
            />
            ))}
        </RechartsAreaChart>
        </ResponsiveContainer>
    </div>
  );
}
