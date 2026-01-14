// Simulation configuration types
export interface SimulationConfig {
    max_ticks: number;
    // Add more config fields as needed
}

// Simulation result types
export interface SimulationResult {
    status: string;
    message: string;
    ticks: number;
    validators: number;
    // Add more result fields
}

// Validator metrics
export interface ValidatorMetrics {
    block: number;
    active_validators: number;
    total_active_stake: number;
    nc33: number;
    nc50: number;
}

// Stake distribution
export interface StakeDistribution {
    block: number;
    stakes: number[];
    top_1_share: number;
    top_5_share: number;
    gini: number;
}

// Survival metrics
export interface SurvivalMetrics {
    time_to_first_exit?: number;
    time_to_nc33_breach?: number;
    time_to_nc50_breach?: number;
    time_to_collapse?: number;
    min_nc33: number;
    min_nc50: number;
}

// Complete simulation output
export interface SimulationOutput {
    domain: string;
    total_ticks: number;
    stopped_early: boolean;
    stop_reason?: string;
    global_metrics: ValidatorMetrics[];
    survival_metrics: SurvivalMetrics;
    distribution_snapshots: StakeDistribution[];
}

// UI State types
export interface AppState {
    wasmReady: boolean;
    loading: boolean;
    error: string | null;
    simulationResult: SimulationOutput | null;
}
