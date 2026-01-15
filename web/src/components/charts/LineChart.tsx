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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis 
          dataKey={xKey}
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
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
