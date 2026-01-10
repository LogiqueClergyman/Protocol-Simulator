use crate::bootstrap::SimulationResults;
use crate::domain::validator::metrics::global::ValidatorGlobalMetrics;
use crate::domain::validator::metrics::{EveryNBlocks, ValidatorListeners};
use crate::metrics::recorder::MetricsRecorder;

/// Trait for printing domain-specific results
pub trait ResultPrinter {
    fn print(&self, results: SimulationResults);
}

/// Validator result printer
pub struct ValidatorResultPrinter;

impl ResultPrinter for ValidatorResultPrinter {
    fn print(&self, results: SimulationResults) {
        // Downcast the results to validator-specific types
        let recorder = results
            .records
            .downcast::<MetricsRecorder<ValidatorGlobalMetrics>>()
            .expect("Failed to downcast recorder");

        let listeners = results
            .listeners
            .downcast::<ValidatorListeners<EveryNBlocks>>()
            .expect("Failed to downcast listeners");

        println!(
            "Simulation finished with {} records",
            recorder.records.len()
        );

        if let Some(last) = recorder.records.last() {
            println!("Total validator count: {}", last.active_validators);
            println!("Total active stake: {}", last.total_active_stake);
            println!("Total nc33: {}", last.nc33);
            println!("Total nc50: {}", last.nc50);
        }

        // Clean access to listener data
        println!("Survival metrics: {:#?}", listeners.survival.outcome);
        println!(
            "Stake distribution: {:#?}",
            listeners.distribution.records.last()
        );
    }
}

/// Get the appropriate printer for a domain
pub fn get_printer(domain: &str) -> Box<dyn ResultPrinter> {
    match domain {
        "validator" => Box::new(ValidatorResultPrinter),
        _ => panic!("Unknown domain: {}", domain),
    }
}
