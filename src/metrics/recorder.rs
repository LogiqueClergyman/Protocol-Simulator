pub struct MetricsRecorder<R> {
    pub records: Vec<R>,
}

impl<R> MetricsRecorder<R> {
    pub fn new() -> Self {
        Self {
            records: Vec::new(),
        }
    }

    pub fn push(&mut self, record: R) {
        self.records.push(record);
    }
}
