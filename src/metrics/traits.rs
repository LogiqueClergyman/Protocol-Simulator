pub trait Metrics {
    type State;
    type Record;

    /// Observe state and emit a metric snapshot
    fn record(&mut self, state: &Self::State) -> Self::Record;
}

pub trait MetricsObserver<R> {
    fn observe(&mut self, record: &R);
}

pub trait TickListener<S, G>: std::any::Any {
    fn on_tick(&mut self, state: &S, global: &G);

    /// Helper method to enable downcasting
    fn as_any(&self) -> &dyn std::any::Any;
    fn as_any_mut(&mut self) -> &mut dyn std::any::Any;
}
