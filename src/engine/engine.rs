use crate::domain::traits::Domain;
use crate::metrics::{recorder::MetricsRecorder, traits::Metrics};

pub struct SimulationEngine<D, M>
where
    D: Domain,
    M: Metrics<State = D::State>,
{
    pub domain: D,
    pub metrics: M,
    pub max_ticks: u64,
}

impl<D, M> SimulationEngine<D, M>
where
    D: Domain,
    M: Metrics<State = D::State>,
{
    pub fn run(mut self) -> MetricsRecorder<M::Record> {
        let mut state = self.domain.init_state();
        let mut recorder = MetricsRecorder::new();

        for _ in 0..self.max_ticks {
            self.domain.tick(&mut state);
            let snapshot = self.metrics.record(&state);
            recorder.push(snapshot);
        }

        recorder
    }
}
