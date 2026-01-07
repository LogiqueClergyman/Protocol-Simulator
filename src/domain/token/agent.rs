use super::state::Holder;

impl Holder {
    pub fn sell(&mut self) -> f64 {
        let amount = self.balance * self.sell_ratio;
        self.balance -= amount;
        amount
    }
}
