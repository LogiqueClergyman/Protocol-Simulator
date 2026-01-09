use crate::{
    domain::validator::{metrics::global::ValidatorGlobalMetrics, state::ValidatorWorld},
    metrics::traits::{MetricsObserver, TickListener},
};
#[derive(Debug)]
pub struct SimulationOutcome {
    pub time_to_first_exit: Option<u64>,
    pub time_to_nc33_breach: Option<u64>,
    pub time_to_nc50_breach: Option<u64>,
    pub time_to_collapse: Option<u64>,

    pub min_nc33: usize,
    pub min_nc50: usize,
}

pub struct SurvivalMetricsCollector {
    initial_active_validators: Option<usize>,

    pub outcome: SimulationOutcome,

    liveness_threshold: usize,
    safety_threshold: usize,
}

impl SurvivalMetricsCollector {
    pub fn new(liveness_threshold: usize, safety_threshold: usize) -> Self {
        Self {
            initial_active_validators: None,
            outcome: SimulationOutcome {
                time_to_first_exit: None,
                time_to_nc33_breach: None,
                time_to_nc50_breach: None,
                time_to_collapse: None,
                min_nc33: usize::MAX,
                min_nc50: usize::MAX,
            },
            liveness_threshold,
            safety_threshold,
        }
    }
}

impl MetricsObserver<ValidatorGlobalMetrics> for SurvivalMetricsCollector {
    fn observe(&mut self, metrics: &ValidatorGlobalMetrics) {
        // Initialize baseline
        if self.initial_active_validators.is_none() {
            self.initial_active_validators = Some(metrics.active_validators);
        }

        let initial = self.initial_active_validators.unwrap();

        // Track worst decentralization
        self.outcome.min_nc33 = self.outcome.min_nc33.min(metrics.nc33);
        self.outcome.min_nc50 = self.outcome.min_nc50.min(metrics.nc50);

        let block = metrics.block;

        // F1: first validator exit
        if self.outcome.time_to_first_exit.is_none() && metrics.active_validators < initial {
            self.outcome.time_to_first_exit = Some(block);
        }

        // F2: liveness breach
        if self.outcome.time_to_nc33_breach.is_none() && metrics.nc33 <= self.liveness_threshold {
            self.outcome.time_to_nc33_breach = Some(block);
        }

        // F3: safety breach
        if self.outcome.time_to_nc50_breach.is_none() && metrics.nc50 <= self.safety_threshold {
            self.outcome.time_to_nc50_breach = Some(block);
        }

        // F4: collapse
        if self.outcome.time_to_collapse.is_none() && metrics.active_validators <= 1 {
            self.outcome.time_to_collapse = Some(block);
        }
    }
}

impl TickListener<ValidatorWorld, ValidatorGlobalMetrics> for SurvivalMetricsCollector {
    fn on_tick(&mut self, _state: &ValidatorWorld, global: &ValidatorGlobalMetrics) {
        self.observe(global);
    }

    fn as_any(&self) -> &dyn std::any::Any {
        self
    }

    fn as_any_mut(&mut self) -> &mut dyn std::any::Any {
        self
    }
}
