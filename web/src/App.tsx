import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { ValidatorCharts } from '@/components/domains/validator/ValidatorCharts';

import type { SimulationOutput } from '@/types/simulation';
import { useSimulation } from '@/hooks/useWasm';
import { Loader2, AlertCircle } from 'lucide-react';
import defaultConfig from '../../configs/wasm_default.json';

function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [simulationData, setSimulationData] = useState<SimulationOutput | null>(null);
  const { run, loading, error, isReady } = useSimulation();

  useEffect(() => {
    if (isReady && simulationData === null && !loading) {
      // Pass config explicitly to ensure latest version is used
      // bypassing potential WASM caching issues
      run(defaultConfig)
        .then(data => {
            if (data !== null) setSimulationData(data);
        })
        .catch((err: unknown) => { console.error(err); });
    }
  }, [isReady, run]); // eslint-disable-line react-hooks/exhaustive-deps


  if (!isReady || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-slate-500">
            {!isReady ? 'Initializing WASM...' : 'Running Simulation...'}
          </p>
        </div>
      </div>
    );
  }

  if (error !== null || simulationData === null) {
    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <h3 className="text-lg font-semibold text-slate-900">Simulation Failed</h3>
                <p className="text-sm text-slate-500 max-w-sm">{error ?? 'Failed to load simulation data'}</p>
                <button 
                  onClick={() => { window.location.reload(); }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    Retry
                </button>
            </div>
        </div>
    );
  }

  // Ensure simulationData is present for typing (guaranteed by checks above but TS might need help)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const data = simulationData!;

  const sectionTitles: Record<string, { title: string; subtitle: string }> = {
    overview: { 
      title: 'Overview', 
      subtitle: `${data.domain} simulation • ${data.total_ticks.toLocaleString()} blocks`
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

  const { title, subtitle } = sectionTitles[activeSection] ?? sectionTitles.overview;

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      title={title}
      subtitle={subtitle}
    >
      <ValidatorCharts data={data} section={activeSection} />
    </DashboardLayout>
  );
}

export default App;
