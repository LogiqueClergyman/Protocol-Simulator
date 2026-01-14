import { useState } from 'react';
import { useSimulation } from './hooks/useWasm';
import { StatusBadge, Button, ResultCard } from './components';
import type { SimulationResult } from './types';

function App() {
  const { isReady, loading, error, run, calculateGiniCoefficient } = useSimulation();
  const [result, setResult] = useState<SimulationResult | string | null>(null);

  const handleRunSimulation = async () => {
    const config = {
      max_ticks: 100000,
    };

    const simulationResult = await run(config);
    if (simulationResult) {
      setResult(simulationResult);
    }
  };

  const handleCalculateGini = () => {
    const stakes = [1000, 2000, 1500, 3000, 500, 800, 1200];
    const gini = calculateGiniCoefficient(stakes);
    
    if (gini !== null) {
      setResult({
        status: 'success',
        message: `Gini Coefficient: ${gini.toFixed(4)}`,
        ticks: 0,
        validators: stakes.length,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="card max-w-4xl w-full animate-fade-in">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
            Protocol Simulator
          </h1>
          <p className="text-gray-600 text-lg">
            React + TypeScript + Rust WASM
          </p>
        </header>

        {/* Status */}
        <StatusBadge isReady={isReady} />

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-semibold">Error: {error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={handleRunSimulation}
            disabled={!isReady}
            loading={loading}
            variant="primary"
          >
            Run Simulation
          </Button>

          <Button
            onClick={handleCalculateGini}
            disabled={!isReady}
            variant="secondary"
          >
            Calculate Gini
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8">
            <ResultCard title="Simulation Result" result={result} />
          </div>
        )}

        {/* Tech Stack */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 font-semibold mb-4">
            Built with:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['React 18', 'TypeScript', 'Rust', 'WASM', 'Vite', 'Tailwind', 'Bun'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full text-sm font-semibold"
              >
                {tech}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
