pub trait Domain {
    type State;

    /// Initialize the domain state (from scenario config later)
    fn init_state(&self) -> Self::State;

    /// Advance the domain by exactly one tick
    fn tick(&mut self, state: &mut Self::State);
}
