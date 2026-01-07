use super::state::TokenWorld;
use crate::metrics::traits::Metrics;

pub struct TokenMetrics {
    pub block: u64,
    pub circulating_supply: f64,
    pub total_sold: f64,
    pub average_holder_balance: f64,
    pub active_holders: usize,
}

pub struct TokenMetricsCollector {
    pub total_sold: f64,
}

impl Metrics for TokenMetricsCollector {
    type State = TokenWorld;
    type Record = TokenMetrics;

    fn record(&mut self, state: &Self::State) -> Self::Record {
        let active: Vec<_> = state.holders.iter().filter(|h| h.balance > 0.0).collect();

        let avg_balance = active.iter().map(|h| h.balance).sum::<f64>() / active.len() as f64;

        TokenMetrics {
            block: state.token.current_block,
            circulating_supply: state.token.circulating_supply,
            total_sold: self.total_sold,
            average_holder_balance: avg_balance,
            active_holders: active.len(),
        }
    }
}
