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

#[derive(Debug, Deserialize, Clone)]
pub struct ValidatorConfig {
    pub count: u64,
    pub initial_stake: f64,
    pub tiers: Vec<ValidatorTier>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct ValidatorTier {
    /// Range start (inclusive)
    pub id_range_start: u64,
    /// Range end (inclusive)
    pub id_range_end: u64,
    /// Operating cost per block
    pub operating_cost_per_block: f64,
    /// Risk aversion (0.0 to 1.0)
    pub risk_aversion: f64,
    /// Restake ratio (0.0 to 1.0)
    pub restake_ratio: f64,
    /// Optional description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
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
                // Find the tier for this validator ID
                let tier = self
                    .validators
                    .tiers
                    .iter()
                    .find(|t| id >= t.id_range_start && id <= t.id_range_end)
                    .expect(&format!("No tier found for validator ID {}", id));

                Validator {
                    id,
                    stake: self.validators.initial_stake,
                    balance: 0.0,
                    active: true,
                    operating_cost_per_block: tier.operating_cost_per_block,
                    risk_aversion: tier.risk_aversion,
                    cooldown_blocks_remaining: 0,
                    restake_ratio: tier.restake_ratio,
                }
            })
            .collect();

        ValidatorDomain {
            protocol,
            initial_validators: validators,
        }
    }
}
