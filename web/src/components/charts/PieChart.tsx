import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { dataColors } from '@/styles/theme';

interface PieDataPoint {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieDataPoint[];
  /** Inner radius for donut chart effect */
  innerRadius?: number;
  /** Outer radius */
  outerRadius?: number;
  valueFormatter?: (value: number) => string;
}

/**
 * Themed pie/donut chart for distribution data
 */
export function PieChart({
  data,
  innerRadius = 60,
  outerRadius = 100,
  valueFormatter = (v) => v.toLocaleString(),
}: PieChartProps) {
  const colors = [
    dataColors.validators,
    dataColors.secondary,
    dataColors.tertiary,
    '#2DD4BF',
    '#06B6D4',
    '#0EA5E9',
    '#8B5CF6',
    '#EC4899',
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => 
            percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
          }
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number) => [valueFormatter(value), 'Stake']}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
          formatter={(value) => (
            <span style={{ color: '#374151', fontSize: '12px' }}>{value}</span>
          )}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
