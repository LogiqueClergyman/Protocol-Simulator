use super::{
    agent::Decision,
    state::{ProtocolState, Validator, ValidatorWorld},
};
use crate::domain::traits::Domain;
use rand::Rng;

pub struct ValidatorDomain {
    pub protocol: ProtocolState,
    pub initial_validators: Vec<Validator>,
}

impl Domain for ValidatorDomain {
    type State = ValidatorWorld;

    fn init_state(&self) -> Self::State {
        ValidatorWorld {
            protocol: self.protocol.clone(),
            validators: self.initial_validators.clone(),
        }
    }

    fn tick(&mut self, state: &mut Self::State) {
        let mut rng = rand::rng();
        state.protocol.current_block += 1;

        let total_active_stake: f64 = state
            .validators
            .iter()
            .filter(|v| v.active)
            .map(|v| v.stake)
            .sum();

        if total_active_stake == 0.0 {
            // protocol failure
            panic!("No active validators");
        }

        let decisions: Vec<(usize, Decision)> = state
            .validators
            .iter()
            .enumerate()
            .map(|(i, v)| (i, v.decide(&state.protocol, total_active_stake)))
            .collect();

        for (i, decision) in decisions {
            match decision {
                Decision::Join => state.validators[i].active = true,
                Decision::Leave => {
                    state.validators[i].active = false;
                    state.validators[i].cooldown_blocks_remaining = 50;
                }
                Decision::Stay => {}
            }
        }

        // rewards
        for v in state.validators.iter_mut() {
            if v.active {
                let reward = state.protocol.reward_per_block * (v.stake / total_active_stake);
                let effective_slash_prob =
                    state.protocol.slashing_probability * (1.0 - v.risk_aversion);
                if rng.random::<f64>() < effective_slash_prob {
                    v.stake -= state.protocol.slashing_penalty;

                    if v.stake < state.protocol.min_stake_required {
                        v.active = false;
                        v.cooldown_blocks_remaining = 100; // forced exit
                    }
                }
                v.balance += reward;
            } else {
                if v.cooldown_blocks_remaining > 0 {
                    v.cooldown_blocks_remaining -= 1;
                }
            }
        }
    }
}
