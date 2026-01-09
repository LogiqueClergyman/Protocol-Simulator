pub trait SamplingStrategy {
    fn should_sample(&mut self, block: u64) -> bool;
}

pub struct EveryNBlocks {
    pub interval: u64,
}

impl SamplingStrategy for EveryNBlocks {
    fn should_sample(&mut self, block: u64) -> bool {
        block % self.interval == 0
    }
}
