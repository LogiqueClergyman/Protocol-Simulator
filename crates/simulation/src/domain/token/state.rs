#[derive(Clone)]
pub struct TokenState {
    pub total_supply: f64,
    pub circulating_supply: f64,
    pub emission_per_block: f64,
    pub current_block: u64,
}

#[derive(Clone)]
pub struct Holder {
    pub id: u64,
    pub balance: f64,
    pub sell_ratio: f64,
}

pub struct TokenWorld {
    pub token: TokenState,
    pub holders: Vec<Holder>,
}
