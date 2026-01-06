use super::{
    agent::Decision,
    state::{ProtocolState, Validator, ValidatorWorld},
};
use crate::domain::traits::Domain;

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
        state.protocol.current_block += 1;

        let active_count = state.validators.iter().filter(|v| v.active).count().max(1);

        let decisions: Vec<(usize, Decision)> = state
            .validators
            .iter()
            .enumerate()
            .map(|(i, v)| (i, v.decide(&state.protocol, active_count)))
            .collect();

        for (i, decision) in decisions {
            match decision {
                Decision::Join => state.validators[i].active = true,
                Decision::Leave => state.validators[i].active = false,
                Decision::Stay => {}
            }
        }

        // rewards
        let reward_per_validator = state.protocol.reward_per_block / active_count as f64;

        for v in state.validators.iter_mut() {
            if v.active {
                v.balance += reward_per_validator;
            }
        }
    }
}
