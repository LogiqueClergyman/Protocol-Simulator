use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Initialize the WASM module
/// This sets up panic hooks and logging
/// Call this once when your React app loads
#[wasm_bindgen(start)]
pub fn init() {
    // Better error messages in browser console
    console_error_panic_hook::set_once();

    // Initialize logging (log::info! → console.log)
    wasm_logger::init(wasm_logger::Config::default());

    log::info!("Rust WASM module initialized!");
}

/// Configuration for running a simulation
/// This matches your JSON config structure
#[derive(Debug, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct SimulationConfig {
    pub max_ticks: u64,
}

#[wasm_bindgen]
impl SimulationConfig {
    #[wasm_bindgen(constructor)]
    pub fn new(max_ticks: u64) -> Self {
        Self { max_ticks }
    }
}

use simulation::bootstrap::bootstrap_from_json;
use simulation::domain::validator::metrics::{global::ValidatorGlobalMetrics, ValidatorListeners};
use simulation::metrics::recorder::MetricsRecorder;

/// Run a simulation and return results as JSON
///
/// JavaScript usage:
/// ```js
/// import { runSimulation } from './wasm/simulation';
///
/// const config = { max_ticks: 100000, ... };
/// const results = await runSimulation(JSON.stringify(config));
/// const data = JSON.parse(results);
/// ```
#[wasm_bindgen(js_name = runSimulation)]
pub fn run_simulation(config_json: &str) -> Result<String, JsValue> {
    log::info!("Starting simulation from WASM...");

    let runner = bootstrap_from_json(config_json)
        .map_err(|e| JsValue::from_str(&format!("Bootstrap failed: {}", e)))?;

    let results = runner
        .run()
        .map_err(|e| JsValue::from_str(&format!("Simulation failed: {}", e)))?;

    if results.domain == "validator" {
        let recorder = results
            .records
            .downcast_ref::<MetricsRecorder<ValidatorGlobalMetrics>>()
            .ok_or_else(|| JsValue::from_str("Failed to cast records"))?;

        let listeners = results
            .listeners
            .downcast_ref::<ValidatorListeners>()
            .ok_or_else(|| JsValue::from_str("Failed to cast listeners"))?;

        let output = serde_json::json!({
            "domain": results.domain,
            "total_ticks": recorder.records.len(),
            "stopped_early": false, // TODO: Wiring for early stop detection
            "stop_reason": serde_json::Value::Null,
            "global_metrics": recorder.records,
            "survival_metrics": listeners.survival.outcome,
            "distribution_snapshots": listeners.distribution.records
        });

        serde_json::to_string(&output)
            .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))
    } else {
        Err(JsValue::from_str(&format!(
            "Unsupported domain: {}",
            results.domain
        )))
    }
}

/// Example: Simple computation function
/// Shows how to pass data between JS and Rust
#[wasm_bindgen(js_name = calculateGini)]
pub fn calculate_gini(stakes: Vec<f64>) -> f64 {
    if stakes.is_empty() {
        return 0.0;
    }

    let mut sorted = stakes.clone();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());

    let n = sorted.len() as f64;
    let sum: f64 = sorted.iter().sum();

    if sum == 0.0 {
        return 0.0;
    }

    let mut numerator = 0.0;
    for (i, &stake) in sorted.iter().enumerate() {
        numerator += (2.0 * (i as f64 + 1.0) - n - 1.0) * stake;
    }

    numerator / (n * sum)
}
