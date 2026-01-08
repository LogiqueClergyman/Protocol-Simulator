use super::state::ValidatorWorld;
use crate::metrics::traits::Metrics;

#[derive(Debug)]
pub struct ValidatorMetrics {
    pub block: u64,
    pub active_validators: usize,
    pub total_staked: f64,
    pub average_balance: f64,
    pub nakamoto_coefficient_33: usize,
    pub nakamoto_coefficient_50: usize,
    pub stakes: Vec<f64>,
}

pub struct ValidatorMetricsCollector;

impl Metrics for ValidatorMetricsCollector {
    type State = ValidatorWorld;
    type Record = ValidatorMetrics;

    fn record(&mut self, state: &Self::State) -> Self::Record {
        let active: Vec<_> = state.validators.iter().filter(|v| v.active).collect();

        let total_staked = active.iter().map(|v| v.stake).sum::<f64>();
        let average_balance = active.iter().map(|v| v.balance).sum::<f64>() / active.len() as f64;

        let mut stakes: Vec<f64> = active.iter().map(|v| v.stake).collect();
        stakes.sort_by(|a, b| b.partial_cmp(a).unwrap());
        let total_stake: f64 = stakes.iter().sum();

        let nc_33 = compute_nakamoto_coefficient(&mut stakes.clone(), 0.33, total_stake);

        let nc_50 = compute_nakamoto_coefficient(&mut stakes, 0.50, total_stake);

        ValidatorMetrics {
            block: state.protocol.current_block,
            active_validators: active.len(),
            total_staked,
            average_balance,
            nakamoto_coefficient_33: nc_33,
            nakamoto_coefficient_50: nc_50,
            stakes,
        }
    }
}

fn compute_nakamoto_coefficient(stakes: &mut Vec<f64>, threshold_fraction: f64, total_stake: f64) -> usize {
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
