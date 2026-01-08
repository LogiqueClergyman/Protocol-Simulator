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
    println!("active validators: {}", results.records.last().unwrap().active_validators);
    println!("total staked: {}", results.records.last().unwrap().total_staked);
    println!("average balance: {}", results.records.last().unwrap().average_balance);
    println!("nakamoto coefficient 33: {}", results.records.last().unwrap().nakamoto_coefficient_33);
    println!("nakamoto coefficient 50: {}", results.records.last().unwrap().nakamoto_coefficient_50);
    println!("top validator stakes: {:?}", &results.records.last().unwrap().stakes[0..5]);
}
