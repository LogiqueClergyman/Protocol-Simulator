use super::state::ValidatorWorld;
use crate::metrics::traits::Metrics;

#[derive(Debug)]
pub struct ValidatorMetrics {
    pub block: u64,
    pub active_validators: usize,
    pub total_staked: f64,
    pub average_balance: f64,
}

pub struct ValidatorMetricsCollector;

impl Metrics for ValidatorMetricsCollector {
    type State = ValidatorWorld;
    type Record = ValidatorMetrics;

    fn record(&mut self, state: &Self::State) -> Self::Record {
        let active: Vec<_> =
            state.validators.iter().filter(|v| v.active).collect();

        let total_staked = active.iter().map(|v| v.stake).sum::<f64>();
        let average_balance =
            active.iter().map(|v| v.balance).sum::<f64>() / active.len() as f64;

        ValidatorMetrics {
            block: state.protocol.current_block,
            active_validators: active.len(),
            total_staked,
            average_balance,
        }
    }
}
