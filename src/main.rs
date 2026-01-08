mod config;
mod domain;
mod engine;
mod metrics;
use std::fs;

use config::validator::ValidatorScenarioConfig;
use domain::validator::metrics::ValidatorMetricsCollector;
use engine::engine::SimulationEngine;

fn main() {
    let raw = fs::read_to_string("configs/validator_basic.json").expect("failed to read config");

    let scenario: ValidatorScenarioConfig = serde_json::from_str(&raw).expect("invalid config");

    let max_ticks = scenario.simulation.max_ticks;
    let domain = scenario.into_domain();

    let engine = SimulationEngine {
        domain,
        metrics: ValidatorMetricsCollector,
        max_ticks,
    };

    let results = engine.run();
    println!("Simulation finished with {} records", results.records.len());
    println!("{:?}", results.records.last());
}
