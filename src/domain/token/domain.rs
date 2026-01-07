use super::metrics::TokenMetricsCollector;
use super::state::{Holder, TokenState, TokenWorld};
use crate::domain::traits::Domain;

pub struct TokenDomain {
    pub token: TokenState,
    pub initial_holders: Vec<Holder>,
}

impl Domain for TokenDomain {
    type State = TokenWorld;

    fn init_state(&self) -> Self::State {
        TokenWorld {
            token: self.token.clone(),
            holders: self.initial_holders.clone(),
        }
    }

    fn tick(&mut self, state: &mut Self::State) {
        state.token.current_block += 1;

        // Emit new tokens
        let emission = state.token.emission_per_block;
        state.token.circulating_supply += emission;

        let per_holder = emission / state.holders.len() as f64;

        for h in state.holders.iter_mut() {
            h.balance += per_holder;
        }

        // Selling phase
        for h in state.holders.iter_mut() {
            let sold = h.sell();
            // sold tokens represent sell pressure
            // tracked via metrics collector externally
        }
    }
}
