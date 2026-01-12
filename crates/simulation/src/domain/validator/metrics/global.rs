use crate::domain::validator::state::ValidatorWorld;
use crate::metrics::traits::Metrics;
use std::collections::HashMap;

#[derive(Debug)]
pub struct ValidatorGlobalMetrics {
    pub block: u64,
    pub active_validators: usize,
    pub total_active_stake: f64,
    pub nc33: usize,
    pub nc50: usize,
}

#[derive(Debug)]
pub struct StakeDistributionSnapshot {
    pub block: u64,
    // sorted descending
    pub stakes: Vec<f64>,
    // derived summaries
    pub top_1_share: f64,
    pub top_5_share: f64,
    pub gini: f64,
}

#[derive(Debug)]
pub struct ValidatorTrajectoryPoint {
    pub block: u64,
    pub stake: f64,
    pub balance: f64,
    pub active: bool,
}

pub type ValidatorTrajectories = HashMap<u64, Vec<ValidatorTrajectoryPoint>>;

pub struct GlobalMetricsCollector;

impl Metrics for GlobalMetricsCollector {
    type State = ValidatorWorld;
    type Record = ValidatorGlobalMetrics;

    fn record(&mut self, state: &Self::State) -> Self::Record {
        let active: Vec<_> = state.validators.iter().filter(|v| v.active).collect();

        let total_staked = active.iter().map(|v| v.stake).sum::<f64>();
        let mut stakes: Vec<f64> = active.iter().map(|v| v.stake).collect();
        stakes.sort_by(|a, b| b.partial_cmp(a).unwrap());
        let total_stake: f64 = stakes.iter().sum();

        let nc33 = compute_nakamoto_coefficient(&stakes, 0.33, total_stake);
        let nc50 = compute_nakamoto_coefficient(&stakes, 0.50, total_stake);

        ValidatorGlobalMetrics {
            block: state.protocol.current_block,
            active_validators: active.len(),
            total_active_stake: total_staked,
            nc33,
            nc50,
        }
    }
}

fn compute_nakamoto_coefficient(
    stakes: &[f64],
    threshold_fraction: f64,
    total_stake: f64,
) -> usize {
    if stakes.is_empty() {
        return 0;
    }

    let mut cumulative = 0.0;

    for (i, stake) in stakes.iter().enumerate() {
        cumulative += *stake;

        if cumulative >= threshold_fraction * total_stake {
            return i + 1;
        }
    }

    stakes.len()
}
