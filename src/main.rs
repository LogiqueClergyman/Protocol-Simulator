mod bootstrap;
mod config;
mod domain;
mod engine;
mod metrics;
mod output;

use bootstrap::bootstrap_from_file;
use output::get_printer;

fn main() -> anyhow::Result<()> {
    // Bootstrap the simulation from config - fully config-driven!
    let runner = bootstrap_from_file("configs/example_composite.json")?;

    let results = runner.run()?;

    println!("Simulation completed for domain: {}", results.domain);
    println!();

    // Get the appropriate printer and print results
    let printer = get_printer(&results.domain);
    printer.print(results);

    Ok(())
}
