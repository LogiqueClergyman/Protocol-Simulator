#[derive(Clone)]
pub struct ProtocolState {
    pub reward_per_block: f64,
    pub min_stake_required: f64,
    pub slashing_probability: f64,
    pub current_block: u64,
    pub slashing_fraction: f64,
}

#[derive(Clone)]
pub struct Validator {
    pub id: u64,
    pub stake: f64,
    pub balance: f64,
    pub active: bool,
    pub operating_cost_per_block: f64,
    pub risk_aversion: f64,
    pub cooldown_blocks_remaining: u64,
    pub restake_ratio: f64,
}

pub struct ValidatorWorld {
    pub protocol: ProtocolState,
    pub validators: Vec<Validator>,
}
