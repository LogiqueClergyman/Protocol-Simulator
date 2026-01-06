use super::state::{Validator, ProtocolState};

pub enum Decision {
    Join,
    Leave,
    Stay,
}

impl Validator {
    pub fn decide(
        &self,
        protocol: &ProtocolState,
        active_count: usize,
    ) -> Decision {
        let expected_reward =
            protocol.reward_per_block / active_count as f64;

        let expected_cost =
            protocol.operating_cost_per_block
            + (protocol.slashing_probability * protocol.slashing_penalty);

        let expected_profit = expected_reward - expected_cost;

        if self.active {
            if expected_profit < 0.0 {
                Decision::Leave
            } else {
                Decision::Stay
            }
        } else {
            if expected_profit > 0.0 && self.stake >= protocol.min_stake_required {
                Decision::Join
            } else {
                Decision::Stay
            }
        }
    }
}
