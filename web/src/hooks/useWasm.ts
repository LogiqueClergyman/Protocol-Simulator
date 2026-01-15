import { useState, useEffect } from 'react';
import init, { runSimulation, calculateGini } from '../wasm/wasm_bindings';
import type { SimulationOutput } from '../types';

export function useWasm() {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        init()
            .then(() => {
                setIsReady(true);
            })
            .catch((err: unknown) => {
                const message = err instanceof Error ? err.message : String(err);
                if (import.meta.env.DEV) {
                    console.error('Failed to initialize WASM:', message);
                }
                setError(message);
            });
    }, []);

    return { isReady, error };
}

export function useSimulation() {
    const { isReady } = useWasm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const run = async (config?: string | object): Promise<SimulationOutput | null> => {
        if (!isReady) {
            setError('WASM module not ready');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            // Yield to event loop to allow UI to update loading state
            await new Promise(resolve => setTimeout(resolve, 0));

            const resultJson = runSimulation(JSON.stringify(config));
            const result = JSON.parse(resultJson) as SimulationOutput;
            return result;
        } catch (err) {
            console.error('Simulation Error:', err);
            const errorMessage = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Unknown error');
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const calculateGiniCoefficient = (stakes: number[]): number | null => {
        if (!isReady) {
            setError('WASM module not ready');
            return null;
        }

        try {
            return calculateGini(new Float64Array(stakes));
        } catch (err) {
            console.error('WASM Error:', err);
            const errorMessage = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Unknown error');
            setError(errorMessage);
            return null;
        }
    };

    return {
        isReady,
        loading,
        error,
        run,
        calculateGiniCoefficient,
    };
}
