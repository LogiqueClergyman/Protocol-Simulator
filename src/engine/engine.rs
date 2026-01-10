use crate::domain::traits::Domain;
use crate::metrics::{
    recorder::MetricsRecorder,
    traits::{Metrics, TickListener},
};

pub struct SimulationEngine<D, M, L>
where
    D: Domain,
    M: Metrics<State = D::State>,
{
    pub domain: D,
    pub metrics: M,
    pub listeners: L,
    pub max_ticks: u64,
}

impl<D, M, L> SimulationEngine<D, M, L>
where
    D: Domain,
    D::State: 'static,
    M: Metrics<State = D::State>,
    M::Record: 'static,
    L: TickListener<D::State, M::Record>,
{
    pub fn run(mut self) -> (MetricsRecorder<M::Record>, L) {
        let mut state = self.domain.init_state();
        let mut recorder = MetricsRecorder::new();

        for _ in 0..self.max_ticks {
            self.domain.tick(&mut state);
            let global = self.metrics.record(&state);

            self.listeners.on_tick(&state, &global);

            recorder.push(global);
        }

        (recorder, self.listeners)
    }
}
