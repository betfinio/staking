import type { Address } from 'viem';

export interface Claim {
	staker: Address;
	amount: bigint;
	timestamp: number;
	transaction: Address;
}

export interface Earning {
	staker: Address;
	amount: bigint;
	timestamp: number;
	transaction: Address;
	pool: Address;
}

export interface Unstake {
	staker: Address;
	amount: bigint;
	timestamp: number;
	transaction: Address;
}

export interface ExtendedPoolInfo extends PoolInfo {
	realStaked: bigint;
	balance: bigint;
}

export interface PoolInfo {
	totalStaked: bigint;
	count: number;
	totalProfit: bigint;
	address: Address;
}

export type StakingType = 'conservative' | 'dynamic';
