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
    pub fn run(mut self) -> anyhow::Result<(MetricsRecorder<M::Record>, L)> {
        let mut state = self.domain.init_state();
        let mut recorder = MetricsRecorder::new();

        for tick in 0..self.max_ticks {
            if let Err(e) = self.domain.tick(&mut state) {
                eprintln!(
                    "\n⚠️  Simulation stopped at tick {}/{}: {}",
                    tick, self.max_ticks, e
                );
                eprintln!(
                    "📊 Returning {} ticks of collected data for analysis\n",
                    recorder.records.len()
                );
                return Ok((recorder, self.listeners));
            }

            let global = self.metrics.record(&state);
            self.listeners.on_tick(&state, &global);
            recorder.push(global);
        }

        Ok((recorder, self.listeners))
    }
}
