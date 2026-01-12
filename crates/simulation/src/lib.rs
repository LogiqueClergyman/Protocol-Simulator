// Protocol Simulator Library
//
// This library provides a generic simulation framework for protocol analysis,
// with a focus on validator economics and decentralization metrics.

pub mod bootstrap;
pub mod config;
pub mod domain;
pub mod engine;
pub mod metrics;
pub mod output;

// Re-export commonly used types
pub use bootstrap::{SimulationResults, SimulationRunner, bootstrap_from_file};
pub use domain::traits::Domain;
pub use engine::engine::SimulationEngine;
pub use metrics::traits::{Metrics, TickListener};
