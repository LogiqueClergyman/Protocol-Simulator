pub trait Metrics {
    type State;
    type Record;

    /// Observe state and emit a metric snapshot
    fn record(&mut self, state: &Self::State) -> Self::Record;
}
