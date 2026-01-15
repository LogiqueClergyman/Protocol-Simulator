import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { ValidatorCharts } from '@/components/domains/validator';
import type { SimulationOutput } from '@/types/simulation';

// Generate realistic stake distribution (power law)
function generateRealisticStakes(count: number, totalStake: number): number[] {
  const stakes: number[] = [];
  
  for (let i = 0; i < count; i++) {
    const rank = i + 1;
    const stake = totalStake / (rank ** 1.5);
    stakes.push(stake);
  }
  
  const sum = stakes.reduce((a, b) => a + b, 0);
  return stakes.map(s => (s / sum) * totalStake);
}

const realisticStakes = generateRealisticStakes(100, 10000000);

// Mock data - Realistic growing protocol
const mockSimulationData: SimulationOutput = {
  domain: 'validator',
  total_ticks: 100000,
  stopped_early: false,
  stop_reason: undefined,
  global_metrics: Array.from({ length: 100 }, (_, i) => {
    const progress = i / 100;
    return {
      block: i * 1000,
      active_validators: Math.floor(80 + i * 0.3 + Math.sin(i / 8) * 5),
      total_active_stake: 8000000 + i * 20000 + Math.sin(i / 6) * 100000,
      nc33: Math.floor(10 - progress * 2 + Math.sin(i / 15) * 1.5),
      nc50: Math.floor(18 - progress * 3 + Math.sin(i / 12) * 2),
    };
  }),
  survival_metrics: {
    time_to_first_exit: 12000,
    time_to_nc33_breach: undefined,
    time_to_nc50_breach: undefined,
    time_to_collapse: undefined,
    min_nc33: 8,
    min_nc50: 15,
  },
  distribution_snapshots: [
    {
      block: 100000,
      stakes: realisticStakes,
      top_1_share: 0.18,
      top_5_share: 0.52,
      gini: 0.42,
    },
  ],
};

function App() {
  const [activeSection, setActiveSection] = useState('overview');
  
  // For now, use mock data directly
  // TODO: Wire up to real simulation via WASM
  const simulationData = mockSimulationData;

  const sectionTitles: Record<string, { title: string; subtitle: string }> = {
    overview: { 
      title: 'Overview', 
      subtitle: `${simulationData.domain} simulation • ${simulationData.total_ticks.toLocaleString()} blocks`
    },
    decentralization: { 
      title: 'Decentralization Metrics', 
      subtitle: 'Nakamoto coefficients and centralization analysis'
    },
    distribution: { 
      title: 'Stake Distribution', 
      subtitle: 'Validator stake concentration and Gini coefficient'
    },
    survival: { 
      title: 'Survival Analysis', 
      subtitle: 'Critical events and protocol health timeline'
    },
  };

  const { title, subtitle } = sectionTitles[activeSection] || sectionTitles.overview;

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      title={title}
      subtitle={subtitle}
    >
      <ValidatorCharts data={simulationData} section={activeSection} />
    </DashboardLayout>
  );
}

export default App;
