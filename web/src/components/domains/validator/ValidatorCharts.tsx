import React from 'react';
import { ChartContainer, AreaChart, LineChart, BarChart, PieChart } from '@/components/charts';
import { ChartGrid, StatCard } from '@/components/dashboard';
import type { SimulationOutput } from '@/types/simulation';
import { dataColors } from '@/styles/theme';

interface ValidatorChartsProps {

  data: SimulationOutput;
  section: string;
}

/**
 * Validator domain chart components
 * Renders different chart sets based on active section
 */
export function ValidatorCharts({ data, section }: ValidatorChartsProps) {
  const latestMetrics = data.global_metrics[data.global_metrics.length - 1];
  const firstMetrics = data.global_metrics[0];
  const latestDistribution = data.distribution_snapshots[data.distribution_snapshots.length - 1];

  // Calculate changes
  const validatorChange = firstMetrics.active_validators > 0 
    ? ((latestMetrics.active_validators - firstMetrics.active_validators) / firstMetrics.active_validators * 100) 
    : 0;
  const stakeChange = firstMetrics.total_active_stake > 0 
    ? ((latestMetrics.total_active_stake - firstMetrics.total_active_stake) / firstMetrics.total_active_stake * 100) 
    : 0;

  if (section === 'overview') {
    return <OverviewSection data={data} validatorChange={validatorChange} stakeChange={stakeChange} />;
  }

  if (section === 'decentralization') {
    return <DecentralizationSection data={data} />;
  }

  if (section === 'distribution') {
    return <DistributionSection distribution={latestDistribution} />;
  }

  if (section === 'survival') {
    return <SurvivalSection data={data} />;
  }

  return <OverviewSection data={data} validatorChange={validatorChange} stakeChange={stakeChange} />;
}

// Helper hook to downsample data for visualization
// Reduces 1M+ points to a manageable number (e.g. 2000) for Recharts
// Helper hook to downsample data for visualization
// Uses simple uniform sampling (every Nth point) as requested by user
// to avoid visual noise from high-frequency volatility.
function useDownsampledMetrics(metrics: SimulationOutput['global_metrics'], targetPoints = 2000) {
  return React.useMemo(() => {
    // If we have fewer points than target, just return all of them
    if (metrics.length <= targetPoints) return metrics;
    
    const sampled = [];
    const step = Math.ceil(metrics.length / targetPoints);
    
    for (let i = 0; i < metrics.length; i += step) {
      sampled.push(metrics[i]);
    }
    
    // Always ensure the very first and last points are included
    if (sampled[0] !== metrics[0]) {
      sampled.unshift(metrics[0]);
    }
    if (sampled[sampled.length - 1] !== metrics[metrics.length - 1]) {
      sampled.push(metrics[metrics.length - 1]);
    }
    
    return sampled;
  }, [metrics, targetPoints]);
}

// --- Overview Section ---
interface OverviewSectionProps {
  data: SimulationOutput;
  validatorChange: number;
  stakeChange: number;
}

function OverviewSection({ data, validatorChange, stakeChange }: OverviewSectionProps) {
  const latestMetrics = data.global_metrics[data.global_metrics.length - 1];
  const chartData = useDownsampledMetrics(data.global_metrics);
  
  // Check for collapse (either recorded metric OR engine stop)
  const isCollapsed = (data.survival_metrics.time_to_collapse !== undefined && data.survival_metrics.time_to_collapse !== null) || data.stopped_early;
  
  // If collapsed, override display values to show 0
  const displayValidators = isCollapsed ? 0 : latestMetrics.active_validators;
  const displayStake = isCollapsed ? 0 : latestMetrics.total_active_stake;

  // Add a final 0 point to chart if collapsed
  const finalChartData = React.useMemo(() => {
    if (!isCollapsed) return chartData;
    const lastBlock = chartData[chartData.length - 1].block;
    return [
      ...chartData,
      {
        ...chartData[chartData.length - 1],
        block: lastBlock + 1,
        active_validators: 0,
        total_active_stake: 0,
        nc33: 0,
        nc50: 0
      }
    ];
  }, [chartData, isCollapsed]);

  return (
    <div className="space-y-6">
      {isCollapsed && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
           <div>
             <div className="font-semibold">Protocol Collapsed!</div>
             <div className="text-sm text-red-700">
               {data.stop_reason 
                 ? `Simulation stopped early: ${data.stop_reason}`
                 : `The protocol failed at block ${data.survival_metrics.time_to_collapse?.toLocaleString()} due to validator exodus.`
               }
             </div>
           </div>
        </div>
      )}

      {/* Stats Row */}
      <ChartGrid>
        <ChartGrid.Item colSpan={3}>
          <StatCard
            label="Active Validators"
            value={displayValidators.toLocaleString()}
            change={isCollapsed ? -100 : validatorChange}
            variant="primary"
          />
        </ChartGrid.Item>
        <ChartGrid.Item colSpan={3}>
          <StatCard
            label="Total Stake"
            value={formatStake(displayStake)}
            change={isCollapsed ? -100 : stakeChange}
            variant="success"
          />
        </ChartGrid.Item>
        <ChartGrid.Item colSpan={3}>
          <StatCard
            label="NC33"
            value={latestMetrics.nc33}
            unit="validators"
          />
        </ChartGrid.Item>
        <ChartGrid.Item colSpan={3}>
          <StatCard
            label="NC50"
            value={latestMetrics.nc50}
            unit="validators"
          />
        </ChartGrid.Item>
      </ChartGrid>

      {/* Main Chart - Full Width */}
      <ChartContainer 
        title="Protocol Health Over Time" 
        subtitle="Active validators and total stake progression"
        height={350}
      >
        <AreaChart
          data={finalChartData}
          xKey="block"
          yKeys={[
            { key: 'total_active_stake', name: 'Stake', color: dataColors.stake },
            { key: 'active_validators', name: 'Validators', color: dataColors.validators, yAxisId: 'right' },
          ]}
          xFormatter={formatBlock}
          yFormatter={formatStake}
          rightYFormatter={(v) => v.toLocaleString()}
        />

      </ChartContainer>

      {/* Secondary Charts - 2/3 + 1/3 */}
      <ChartGrid>
        <ChartGrid.Item colSpan={8}>
          <ChartContainer 
            title="Nakamoto Coefficients" 
            subtitle="Decentralization metrics over time"
            height={300}
          >
            <LineChart
              data={chartData}
              xKey="block"
              yKeys={[
                { key: 'nc33', name: 'NC33' },
                { key: 'nc50', name: 'NC50' },
              ]}
              xFormatter={formatBlock}
              referenceLines={[
                { y: 5, label: 'Critical', color: '#EF4444' },
              ]}
            />
          </ChartContainer>
        </ChartGrid.Item>
        <ChartGrid.Item colSpan={4}>
          <SurvivalSummaryCard metrics={data.survival_metrics} />
        </ChartGrid.Item>
      </ChartGrid>
    </div>
  );
}

// --- Decentralization Section ---
function DecentralizationSection({ data }: { data: SimulationOutput }) {
  const chartData = useDownsampledMetrics(data.global_metrics);

  return (
    <div className="space-y-6">
      <ChartContainer 
        title="Nakamoto Coefficients Over Time" 
        subtitle="Number of validators needed to control 33% and 50% of stake"
        height={400}
      >
        <LineChart
          data={chartData}
          xKey="block"
          yKeys={[
            { key: 'nc33', name: 'NC33 (33% stake)' },
            { key: 'nc50', name: 'NC50 (50% stake)' },
          ]}
          xFormatter={formatBlock}
          referenceLines={[
            { y: 5, label: 'Critical Threshold', color: '#EF4444' },
            { y: 10, label: 'Warning Threshold', color: '#F59E0B' },
          ]}
        />
      </ChartContainer>

      <ChartGrid>
        <ChartGrid.Item colSpan={6}>
          <StatCard
            label="Minimum NC33"
            value={data.survival_metrics.min_nc33}
            unit="validators"
          />
        </ChartGrid.Item>
        <ChartGrid.Item colSpan={6}>
          <StatCard
            label="Minimum NC50"
            value={data.survival_metrics.min_nc50}
            unit="validators"
          />
        </ChartGrid.Item>
      </ChartGrid>
    </div>
  );
}

// --- Distribution Section ---
function DistributionSection({ distribution }: { distribution: SimulationOutput['distribution_snapshots'][0] }) {
  const topValidators = distribution.stakes.slice(0, 30).map((stake: number, i: number) => ({
    rank: i + 1,
    stake,
  }));


  // For pie chart - group top 5 and "Others"
  const pieData = [
    { name: 'Top 1', value: distribution.stakes[0] || 0 },
    { name: 'Top 2-5', value: distribution.stakes.slice(1, 5).reduce((a, b) => a + b, 0) },
    { name: 'Others', value: distribution.stakes.slice(5).reduce((a, b) => a + b, 0) },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <ChartGrid>
        <ChartGrid.Item colSpan={4}>
          <StatCard
            label="Top 1 Share"
            value={`${(distribution.top_1_share * 100).toFixed(1)}%`}
          />
        </ChartGrid.Item>
        <ChartGrid.Item colSpan={4}>
          <StatCard
            label="Top 5 Share"
            value={`${(distribution.top_5_share * 100).toFixed(1)}%`}
          />
        </ChartGrid.Item>
        <ChartGrid.Item colSpan={4}>
          <StatCard
            label="Gini Coefficient"
            value={distribution.gini.toFixed(4)}
          />
        </ChartGrid.Item>
      </ChartGrid>

      {/* Charts */}
      <ChartGrid>
        <ChartGrid.Item colSpan={7}>
          <ChartContainer 
            title="Stake Distribution" 
            subtitle="Top 30 validators by stake"
            height={350}
          >
            <BarChart
              data={topValidators}
              xKey="rank"
              yKey="stake"
              xFormatter={(v) => `#${v.toString()}`}
              yFormatter={formatStake}
            />
          </ChartContainer>
        </ChartGrid.Item>
        <ChartGrid.Item colSpan={5}>
          <ChartContainer 
            title="Stake Concentration" 
            subtitle="Distribution by validator groups"
            height={350}
          >
            <PieChart
              data={pieData}
              innerRadius={50}
              outerRadius={90}
              valueFormatter={formatStake}
            />
          </ChartContainer>
        </ChartGrid.Item>
      </ChartGrid>
    </div>
  );
}

// --- Survival Section ---
function SurvivalSection({ data }: { data: SimulationOutput }) {
  const { survival_metrics } = data;
  
  const events = [
    { 
      label: 'First Exit', 
      value: survival_metrics.time_to_first_exit,
      status: (survival_metrics.time_to_first_exit ?? 0) > 0 ? 'triggered' : 'ok'
    },
    { 
      label: 'NC33 Breach', 
      value: survival_metrics.time_to_nc33_breach,
      status: (survival_metrics.time_to_nc33_breach ?? 0) > 0 ? 'critical' : 'ok'
    },
    { 
      label: 'NC50 Breach', 
      value: survival_metrics.time_to_nc50_breach,
      status: (survival_metrics.time_to_nc50_breach ?? 0) > 0 ? 'critical' : 'ok'
    },
    { 
      label: 'Collapse', 
      value: survival_metrics.time_to_collapse,
      status: ((survival_metrics.time_to_collapse ?? 0) > 0 || data.stopped_early) ? 'critical' : 'ok'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Critical Events Timeline</h3>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <span className="font-medium text-foreground">{event.label}</span>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${
                  event.status === 'ok' ? 'text-emerald-600' :
                  event.status === 'triggered' ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {event.value !== undefined ? `Block ${formatBlock(event.value)}` : 'N/A'}
                </span>
                <span className={`w-3 h-3 rounded-full ${
                  event.status === 'ok' ? 'bg-emerald-500' :
                  event.status === 'triggered' ? 'bg-amber-500' :
                  'bg-red-500'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <ChartGrid>
        <ChartGrid.Item colSpan={6}>
          <StatCard
            label="Min NC33"
            value={survival_metrics.min_nc33}
            unit="validators"
          />
        </ChartGrid.Item>
        <ChartGrid.Item colSpan={6}>
          <StatCard
            label="Min NC50"
            value={survival_metrics.min_nc50}
            unit="validators"
          />
        </ChartGrid.Item>
      </ChartGrid>
    </div>
  );
}

// --- Helpers ---
function SurvivalSummaryCard({ metrics }: { metrics: SimulationOutput['survival_metrics'] }) {
  const events = [
    { label: 'First Exit', value: metrics.time_to_first_exit, unit: 'blocks' },
    { label: 'NC33 Breach', value: metrics.time_to_nc33_breach, unit: 'blocks' },
    { label: 'NC50 Breach', value: metrics.time_to_nc50_breach, unit: 'blocks' },
    { label: 'Collapse', value: metrics.time_to_collapse, unit: 'blocks' },
  ];

  return (
    <div className="bg-card rounded-lg border border-border h-full p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">Survival Events</h3>
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.label} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{event.label}</span>
            <span className={`text-sm font-medium ${
              event.value === undefined || event.value === null ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {event.value !== undefined && event.value !== null ? formatBlock(event.value) : 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatStake(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

function formatBlock(value: number): string {
  return value.toLocaleString();
}
