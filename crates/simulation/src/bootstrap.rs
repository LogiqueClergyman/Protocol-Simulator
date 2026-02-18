use crate::config::root::{ListenersConfig, RootConfig, SamplingStrategyConfig};
use crate::config::validator::ValidatorScenarioConfig;
use crate::domain::validator::metrics::sampling::SamplingStrategy;
use crate::domain::validator::metrics::survival::EventRegistry;
use crate::domain::validator::metrics::{
    EveryNBlocks, GlobalMetricsCollector, OnEvent, ValidatorListeners,
};
use crate::engine::engine::SimulationEngine;
use anyhow::{anyhow, Result};
use std::fs;
use std::sync::{Arc, Mutex};

/// Bootstrap the simulation from a config file
pub fn bootstrap_from_file(path: &str) -> Result<Box<dyn SimulationRunner>> {
    let raw = fs::read_to_string(path)?;
    bootstrap_from_json(&raw)
}

/// Bootstrap the simulation from a JSON string
pub fn bootstrap_from_json(json: &str) -> Result<Box<dyn SimulationRunner>> {
    let root_config: RootConfig = serde_json::from_str(json)?;

    match root_config.domain.as_str() {
        "validator" => bootstrap_validator(json),
        other => Err(anyhow!("Unknown domain type: {}", other)),
    }
}

/// Trait for running any simulation
pub trait SimulationRunner {
    fn run(self: Box<Self>) -> Result<SimulationResults>;
}

/// Generic simulation results
pub struct SimulationResults {
    pub domain: String,
    pub records: Box<dyn std::any::Any>,
    pub listeners: Box<dyn std::any::Any>,
}

/// Bootstrap a validator simulation
fn bootstrap_validator(config_json: &str) -> Result<Box<dyn SimulationRunner>> {
    let config: ValidatorScenarioConfig = serde_json::from_str(config_json)?;

    let max_ticks = config.simulation.max_ticks;

    // Build listeners based on config (before moving config)
    let listeners = build_validator_listeners(&config.listeners)?;

    let domain = config.into_domain();

    let engine = SimulationEngine {
        domain,
        metrics: GlobalMetricsCollector,
        listeners,
        max_ticks,
    };

    Ok(Box::new(GenericSimulationRunner {
        domain_name: "validator".to_string(),
        engine,
    }))
}

/// Build validator listeners from config
fn build_validator_listeners(config: &ListenersConfig) -> Result<ValidatorListeners> {
    let survival_config = config
        .survival
        .as_ref()
        .ok_or_else(|| anyhow!("Survival listener config required"))?;

    let distribution_config = config
        .distribution
        .as_ref()
        .ok_or_else(|| anyhow!("Distribution listener config required"))?;

    let sampling_strategies: Vec<Box<dyn SamplingStrategy>> = distribution_config
        .sampling_strategies
        .iter()
        .map(|strategy| -> Box<dyn SamplingStrategy> {
            match strategy {
                SamplingStrategyConfig::EveryNBlocks { interval } => Box::new(EveryNBlocks {
                    interval: *interval,
                }),
                SamplingStrategyConfig::OnEvent { event } => {
                    let events = Arc::new(Mutex::new(EventRegistry::default()));
                    Box::new(OnEvent::new(*event, events.clone()))
                }
            }
        })
        .collect();

    Ok(ValidatorListeners::new(
        survival_config.liveness_threshold,
        survival_config.safety_threshold,
        sampling_strategies,
    ))
}

/// Generic runner that works for any domain
struct GenericSimulationRunner<D, M, L>
where
    D: crate::domain::traits::Domain + 'static,
    D::State: 'static,
    M: crate::metrics::traits::Metrics<State = D::State> + 'static,
    M::Record: 'static,
    L: crate::metrics::traits::TickListener<D::State, M::Record> + 'static,
{
    domain_name: String,
    engine: SimulationEngine<D, M, L>,
}

impl<D, M, L> SimulationRunner for GenericSimulationRunner<D, M, L>
where
    D: crate::domain::traits::Domain + 'static,
    D::State: 'static,
    M: crate::metrics::traits::Metrics<State = D::State> + 'static,
    M::Record: 'static,
    L: crate::metrics::traits::TickListener<D::State, M::Record> + 'static,
{
    fn run(self: Box<Self>) -> Result<SimulationResults> {
        let (recorder, listeners) = self.engine.run()?;

        Ok(SimulationResults {
            domain: self.domain_name,
            records: Box::new(recorder),
            listeners: Box::new(listeners),
        })
    }
}
