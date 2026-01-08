use super::state::{ProtocolState, Validator};

pub enum Decision {
    Join,
    Leave,
    Stay,
}

impl Validator {
    pub fn decide(&self, protocol: &ProtocolState, total_active_stake: f64) -> Decision {
        if self.cooldown_blocks_remaining > 0 {
            return Decision::Stay;
        }

        let reward = protocol.reward_per_block * (self.stake / total_active_stake);

        let expected_slashing_cost =
            protocol.slashing_probability * protocol.slashing_penalty * self.risk_aversion;

        let risk_adjusted_profit = reward - self.operating_cost_per_block - expected_slashing_cost;

        if self.active {
            if risk_adjusted_profit < 0.0 {
                Decision::Leave
            } else {
                Decision::Stay
            }
        } else {
            if risk_adjusted_profit > 0.0 && self.stake >= protocol.min_stake_required {
                Decision::Join
            } else {
                Decision::Stay
            }
        }
    }
}
