use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct RootConfig {
    pub domain: String,
    pub simulation: SimulationConfig,
    #[serde(flatten)]
    pub domain_config: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct SimulationConfig {
    pub max_ticks: u64,
}

#[derive(Debug, Deserialize)]
pub struct MetricsConfig {
    pub enabled: bool,
    #[serde(default)]
    pub collectors: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct ListenersConfig {
    #[serde(default)]
    pub survival: Option<SurvivalListenerConfig>,
    #[serde(default)]
    pub distribution: Option<DistributionListenerConfig>,
}

#[derive(Debug, Deserialize)]
pub struct SurvivalListenerConfig {
    pub enabled: bool,
    pub liveness_threshold: usize,
    pub safety_threshold: usize,
}

#[derive(Debug, Deserialize)]
pub struct DistributionListenerConfig {
    pub enabled: bool,
    pub sampling_strategy: SamplingStrategyConfig,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum SamplingStrategyConfig {
    EveryNBlocks { interval: u64 },
    // Can add more strategies here
}
