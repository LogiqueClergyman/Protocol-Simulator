import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell,
} from 'recharts';
import { dataColors } from '@/styles/theme';

interface BarChartProps<T> {
  data: T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  xFormatter?: (value: number | string) => string;
  yFormatter?: (value: number) => string;
  /** Use gradient coloring for bars */
  useGradient?: boolean;
}

/**
 * Themed bar chart with optional gradient coloring
 */
export function BarChart<T extends object>({
  data,
  xKey,
  yKey,
  xFormatter = (v) => String(v),
  yFormatter = (v) => v.toLocaleString(),
  useGradient = true,
}: BarChartProps<T>) {
  const colors = dataColors.distribution;

  // Generate color based on position (darker for top validators)
  const getBarColor = (index: number, total: number) => {
    if (!useGradient) return colors[0];
    
    // Top 3 get distinct colors
    if (index < colors.length) return colors[index];
    
    // Rest fade to muted
    const opacity = 1 - (index / total) * 0.6;
    return `rgba(27, 212, 136, ${opacity.toString()})`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis 
          dataKey={xKey}
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          tickFormatter={xFormatter}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={yFormatter}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number | undefined) => {
            const safeValue = typeof value === 'number' ? value : 0;
            return [yFormatter(safeValue), 'Stake'];
          }}
        />
        <Bar 
          dataKey={yKey} 
          radius={[4, 4, 0, 0]}
        >
          {data.map((_, index) => (
            <Cell 
              key={`cell-${index.toString()}`} 
              fill={getBarColor(index, data.length)}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
