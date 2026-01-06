mod engine;
mod domain;
mod metrics;
use engine::engine::SimulationEngine;
use domain::validator::{
    domain::ValidatorDomain,
    state::{ProtocolState, Validator},
    metrics::ValidatorMetricsCollector,
};

fn main() {
    let protocol = ProtocolState {
        reward_per_block: 100.0,
        min_stake_required: 1000.0,
        operating_cost_per_block: 1.0,
        slashing_probability: 0.0001,
        slashing_penalty: 500.0,
        current_block: 0,
    };

    let validators = (0..100)
        .map(|i| Validator {
            id: i,
            stake: 1200.0,
            balance: 0.0,
            active: true,
        })
        .collect();

    let domain = ValidatorDomain {
        protocol,
        initial_validators: validators,
    };

    let engine = SimulationEngine {
        domain,
        metrics: ValidatorMetricsCollector,
        max_ticks: 100_000,
    };

    let results = engine.run();
    println!("Simulation finished with {} records", results.records.len());
    println!("{:?}", results.records.last());
}
