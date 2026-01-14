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

    // For now, return a mock result
    // We'll integrate the real simulation next
    let mock_result = serde_json::json!({
        "status": "success",
        "message": "Simulation completed!",
        "ticks": 100000,
        "validators": 100
    });

    serde_json::to_string(&mock_result)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
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
