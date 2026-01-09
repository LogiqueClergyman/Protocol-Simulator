use super::sampling::SamplingStrategy;
use crate::domain::validator::metrics::global::{
    StakeDistributionSnapshot, ValidatorGlobalMetrics,
};
use crate::domain::validator::state::ValidatorWorld;
use crate::metrics::traits::TickListener;

pub struct StakeDistributionCollector<S>
where
    S: SamplingStrategy,
{
    sampler: S,
    pub records: Vec<StakeDistributionSnapshot>,
}

impl<S> StakeDistributionCollector<S>
where
    S: SamplingStrategy,
{
    pub fn new(sampler: S) -> Self {
        Self {
            sampler,
            records: Vec::new(),
        }
    }

    pub fn record(&mut self, state: &ValidatorWorld) -> Option<StakeDistributionSnapshot> {
        let block = state.protocol.current_block;

        if !self.sampler.should_sample(block) {
            return None;
        }

        let mut stakes: Vec<f64> = state
            .validators
            .iter()
            .filter(|v| v.active)
            .map(|v| v.stake)
            .collect();

        if stakes.is_empty() {
            return None;
        }

        stakes.sort_by(|a, b| b.partial_cmp(a).unwrap());

        let total: f64 = stakes.iter().sum();

        let top_1_share = stakes[0] / total;
        let top_5_share = stakes.iter().take(5).sum::<f64>() / total;

        let gini = compute_gini(stakes.clone());

        Some(StakeDistributionSnapshot {
            block,
            stakes,
            top_1_share,
            top_5_share,
            gini,
        })
    }
}

fn compute_gini(mut values: Vec<f64>) -> f64 {
    let n = values.len();
    if n == 0 {
        return 0.0;
    }

    values.sort_by(|a, b| a.partial_cmp(b).unwrap());

    let sum: f64 = values.iter().sum();
    if sum == 0.0 {
        return 0.0;
    }

    let mut weighted_sum = 0.0;
    for (i, value) in values.iter().enumerate() {
        weighted_sum += (2.0 * (i as f64 + 1.0) - n as f64 - 1.0) * value;
    }

    weighted_sum / (n as f64 * sum)
}

impl<S> TickListener<ValidatorWorld, ValidatorGlobalMetrics> for StakeDistributionCollector<S>
where
    S: SamplingStrategy + 'static,
{
    fn on_tick(&mut self, state: &ValidatorWorld, _global: &ValidatorGlobalMetrics) {
        if let Some(snapshot) = self.record(state) {
            self.records.push(snapshot);
        }
    }

    fn as_any(&self) -> &dyn std::any::Any {
        self
    }

    fn as_any_mut(&mut self) -> &mut dyn std::any::Any {
        self
    }
}
