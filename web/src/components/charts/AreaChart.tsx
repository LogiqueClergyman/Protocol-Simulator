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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
            // Use the correct formatter based on the axis
            const axisId = props?.payload?.yAxisId ?? props?.yAxisId; // Robust check
            const formatter = axisId === 'right' ? rightYFormatter : yFormatter;
            
            // Recharts types can be tricky, ensuring value is treated as number
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
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
