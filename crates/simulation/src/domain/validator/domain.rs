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

    fn tick(&mut self, state: &mut Self::State) -> anyhow::Result<()> {
        let mut rng = rand::rng();
        state.protocol.current_block += 1;

        /* -----------------------------
         * Phase 1: Observe & decide
         * ----------------------------- */
        let observed_total_stake: f64 = state
            .validators
            .iter()
            .filter(|v| v.active)
            .map(|v| v.stake)
            .sum();

        if observed_total_stake == 0.0 {
            anyhow::bail!(
                "Protocol failure at block {}: no active validators",
                state.protocol.current_block
            );
        }

        let decisions: Vec<(usize, Decision)> = state
            .validators
            .iter()
            .enumerate()
            .map(|(i, v)| (i, v.decide(&state.protocol, observed_total_stake)))
            .collect();

        /* -----------------------------
         * Phase 2: Apply joins & exits
         * ----------------------------- */

        for (i, decision) in decisions {
            match decision {
                Decision::Join => {
                    if state.validators[i].cooldown_blocks_remaining == 0 {
                        state.validators[i].active = true;
                    }
                }
                Decision::Leave => {
                    state.validators[i].active = false;
                    state.validators[i].cooldown_blocks_remaining = 50;
                }
                Decision::Stay => {}
            }
        }

        /* -----------------------------
         * Phase 3: Cooldowns tick
         * ----------------------------- */

        for v in state.validators.iter_mut() {
            if !v.active && v.cooldown_blocks_remaining > 0 {
                v.cooldown_blocks_remaining -= 1;
            }
        }

        /* -----------------------------
         * Phase 4: Recompute stake base
         * ----------------------------- */

        let total_active_stake: f64 = state
            .validators
            .iter()
            .filter(|v| v.active)
            .map(|v| v.stake)
            .sum();

        if total_active_stake == 0.0 {
            anyhow::bail!(
                "Protocol failure at block {}: all validators exited (no active stake remaining)",
                state.protocol.current_block
            );
        }

        /* -----------------------------
         * Phase 5: Slashing
         * ----------------------------- */

        for v in state.validators.iter_mut() {
            if v.active {
                let effective_slash_prob =
                    state.protocol.slashing_probability * (1.0 - v.risk_aversion);

                if rng.random::<f64>() < effective_slash_prob {
                    let slash_amount = v.stake * state.protocol.slashing_fraction;
                    v.stake -= slash_amount;

                    if v.stake < state.protocol.min_stake_required {
                        v.active = false;
                        v.cooldown_blocks_remaining = 100;
                    }
                }
            }
        }

        /* -----------------------------
         * Phase 6: Reward distribution
         * ----------------------------- */

        let final_total_stake: f64 = state
            .validators
            .iter()
            .filter(|v| v.active)
            .map(|v| v.stake)
            .sum();

        if final_total_stake == 0.0 {
            anyhow::bail!(
                "Protocol failure at block {}: all validators slashed out (no active stake after slashing)",
                state.protocol.current_block
            );
        }

        for v in state.validators.iter_mut() {
            if v.active {
                let reward = state.protocol.reward_per_block * (v.stake / final_total_stake);

                let restaked = reward * v.restake_ratio;
                let income = reward * (1.0 - v.restake_ratio);

                v.stake += restaked;
                v.balance += income;
            }
        }

        Ok(())
    }
}
