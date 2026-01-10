use super::{
    distribution::StakeDistributionCollector, global::ValidatorGlobalMetrics,
    sampling::SamplingStrategy, survival::SurvivalMetricsCollector,
};
use crate::domain::validator::state::ValidatorWorld;
use crate::metrics::traits::TickListener;

/// A collection of all validator metrics listeners
pub struct ValidatorListeners<S: SamplingStrategy> {
    pub survival: SurvivalMetricsCollector,
    pub distribution: StakeDistributionCollector<S>,
}

impl<S: SamplingStrategy> ValidatorListeners<S> {
    pub fn new(liveness_threshold: usize, safety_threshold: usize, sampling_strategy: S) -> Self {
        Self {
            survival: SurvivalMetricsCollector::new(liveness_threshold, safety_threshold),
            distribution: StakeDistributionCollector::new(sampling_strategy),
        }
    }
}

impl<S: SamplingStrategy + 'static> TickListener<ValidatorWorld, ValidatorGlobalMetrics>
    for ValidatorListeners<S>
{
    fn on_tick(&mut self, state: &ValidatorWorld, global: &ValidatorGlobalMetrics) {
        self.survival.on_tick(state, global);
        self.distribution.on_tick(state, global);
    }

    fn as_any(&self) -> &dyn std::any::Any {
        self
    }

    fn as_any_mut(&mut self) -> &mut dyn std::any::Any {
        self
    }
}
