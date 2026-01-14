import { useState, useEffect } from 'react';
import init, { runSimulation, calculateGini } from '../wasm/wasm_bindings';
import type { SimulationConfig, SimulationResult } from '../types';

export function useWasm() {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        init()
            .then(() => {
                console.log('WASM module initialized');
                setIsReady(true);
            })
            .catch((err) => {
                console.error('Failed to initialize WASM:', err);
                setError(err.message);
            });
    }, []);

    return { isReady, error };
}

export function useSimulation() {
    const { isReady } = useWasm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const run = async (config: SimulationConfig): Promise<SimulationResult | null> => {
        if (!isReady) {
            setError('WASM module not ready');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const resultJson = runSimulation(JSON.stringify(config));
            const result = JSON.parse(resultJson) as SimulationResult;
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
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
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
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
