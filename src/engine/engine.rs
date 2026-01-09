use crate::domain::traits::Domain;
use crate::metrics::{
    recorder::MetricsRecorder,
    traits::{Metrics, TickListener},
};

pub struct SimulationEngine<D, M>
where
    D: Domain,
    M: Metrics<State = D::State>,
{
    pub domain: D,
    pub metrics: M,
    pub listeners: Vec<Box<dyn TickListener<D::State, M::Record>>>,
    pub max_ticks: u64,
}

impl<D, M> SimulationEngine<D, M>
where
    D: Domain,
    D: 'static,
    M: Metrics<State = D::State>,
    M::Record: 'static,
{
    pub fn run(
        mut self,
    ) -> (
        MetricsRecorder<M::Record>,
        Vec<Box<dyn TickListener<D::State, M::Record>>>,
    ) {
        let mut state = self.domain.init_state();
        let mut recorder = MetricsRecorder::new();

        for _ in 0..self.max_ticks {
            self.domain.tick(&mut state);
            let global = self.metrics.record(&state);
            for listener in self.listeners.iter_mut() {
                listener.on_tick(&state, &global);
            }
            recorder.push(global);
        }

        (recorder, self.listeners)
    }
}
