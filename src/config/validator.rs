use crate::config::root::{ListenersConfig, MetricsConfig};
use crate::domain::validator::{
    domain::ValidatorDomain,
    state::{ProtocolState, Validator},
};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct ValidatorScenarioConfig {
    pub simulation: SimulationConfig,
    pub protocol: ProtocolConfig,
    pub validators: ValidatorConfig,
    pub metrics: MetricsConfig,
    pub listeners: ListenersConfig,
}

#[derive(Debug, Deserialize)]
pub struct SimulationConfig {
    pub max_ticks: u64,
}

#[derive(Debug, Deserialize)]
pub struct ProtocolConfig {
    pub reward_per_block: f64,
    pub min_stake_required: f64,
    pub slashing_probability: f64,
    pub slashing_fraction: f64,
}

#[derive(Debug, Deserialize)]
pub struct ValidatorConfig {
    pub count: u64,
    pub initial_stake: f64,
}

impl ValidatorScenarioConfig {
    pub fn into_domain(self) -> ValidatorDomain {
        let protocol = ProtocolState {
            reward_per_block: self.protocol.reward_per_block,
            min_stake_required: self.protocol.min_stake_required,
            slashing_probability: self.protocol.slashing_probability,
            slashing_fraction: self.protocol.slashing_fraction,
            current_block: 0,
        };

        let validators = (0..self.validators.count)
            .map(|id| {
                let operating_cost = match id {
                    0..=19 => 0.5,  // professional operators
                    20..=59 => 1.0, // mid-sized
                    60..=89 => 1.5, // small
                    _ => 2.5,       // hobby / marginal
                };

                let risk_aversion = match id {
                    0..=19 => 0.8,
                    20..=59 => 0.5,
                    _ => 0.2,
                };

                let restake_ratio = match id {
                    0..=19 => 0.9,  // large / institutional validators
                    20..=59 => 0.6, // mid-sized operators
                    60..=89 => 0.3, // small validators
                    _ => 0.1,       // hobbyists
                };
                Validator {
                    id,
                    stake: self.validators.initial_stake,
                    balance: 0.0,
                    active: true,
                    operating_cost_per_block: operating_cost,
                    risk_aversion,
                    cooldown_blocks_remaining: 0,
                    restake_ratio,
                }
            })
            .collect();

        ValidatorDomain {
            protocol,
            initial_validators: validators,
        }
    }
}
