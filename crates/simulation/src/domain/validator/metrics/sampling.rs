use std::sync::{Arc, Mutex};

use crate::domain::validator::metrics::survival::{EventRegistry, SimulationEvent};

pub trait SamplingStrategy {
    fn should_sample(&mut self, block: u64) -> bool;
}

pub struct EveryNBlocks {
    pub interval: u64,
}

pub struct OnEvent {
    event: SimulationEvent,
    events: Arc<Mutex<EventRegistry>>,
    fired: bool,
}

impl OnEvent {
    pub fn new(event: SimulationEvent, events: Arc<Mutex<EventRegistry>>) -> Self {
        Self {
            event,
            events,
            fired: false,
        }
    }
}

impl SamplingStrategy for EveryNBlocks {
    fn should_sample(&mut self, block: u64) -> bool {
        block % self.interval == 0
    }
}

impl SamplingStrategy for OnEvent {
    fn should_sample(&mut self, _block: u64) -> bool {
        if self.fired {
            return false;
        }

        if self.events.lock().unwrap().has_triggered(&self.event) {
            self.fired = true;
            return true;
        }

        false
    }
}