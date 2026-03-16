#![no_std]
use soroban_sdk::{contract,contractimpl, symbol_short, Address, Env};
#[contract]
pub struct CrowdfundingContract;
#[contractimpl]
impl CrowdfundingContract {
    pub fn initialize(env: Env, target_amount: i128) {
        env.storage().instance().set(symbol_short!("target"), target_amount);
    }
    pub fn donate(env: Env, amount: i128) -> i128 {
        let mut current_total = env.storage().instance().get::<_, i128>(symbol_short!("current")).unwrap_or(0);
        current_total += amount;
        env.storage().instance().set(symbol_short!("current"), current_total);
        current_total
    }
}