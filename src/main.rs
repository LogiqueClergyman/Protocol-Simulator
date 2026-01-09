mod config;
mod domain;
mod engine;
mod metrics;
use std::fs;

use config::validator::ValidatorScenarioConfig;
use engine::engine::SimulationEngine;

use crate::domain::validator::metrics::{
    EveryNBlocks, GlobalMetricsCollector, StakeDistributionCollector, SurvivalMetricsCollector,
};

fn main() {
    let raw = fs::read_to_string("configs/validator_basic.json").expect("failed to read config");

    let scenario: ValidatorScenarioConfig = serde_json::from_str(&raw).expect("invalid config");

    let max_ticks = scenario.simulation.max_ticks;
    let domain = scenario.into_domain();

    let engine = SimulationEngine {
        domain,
        metrics: GlobalMetricsCollector,
        listeners: vec![
            Box::new(SurvivalMetricsCollector::new(2, 2)),
            Box::new(StakeDistributionCollector::new(EveryNBlocks {
                interval: 100000,
            })),
        ],
        max_ticks,
    };
    let (results, mut listeners) = engine.run();
    println!("Simulation finished with {} records", results.records.len());
    println!(
        "Total validator count: {}",
        results.records.last().unwrap().active_validators
    );
    println!(
        "Total active stake: {}",
        results.records.last().unwrap().total_active_stake
    );
    println!("Total nc33: {}", results.records.last().unwrap().nc33);
    println!("Total nc50: {}", results.records.last().unwrap().nc50);
    println!(
        "Survival metrics: {:#?}",
        listeners[0]
            .as_any_mut()
            .downcast_mut::<SurvivalMetricsCollector>()
            .unwrap()
            .outcome
    );
    println!(
        "Stake distribution: {:#?}",
        listeners[1]
            .as_any_mut()
            .downcast_mut::<StakeDistributionCollector<EveryNBlocks>>()
            .unwrap()
            .records.last()
    );
}
