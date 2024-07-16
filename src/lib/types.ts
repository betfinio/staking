import {Address} from "viem";

export interface Stake {
	start: number
	end: number
	staker: Address
	pool: Address
	amount: bigint
	ended: boolean
	hash?: string,
	staking?: string,
	reward?: bigint,
	block?: number,
	username?: string,
	customUsername?: string
}

export interface Claim {
	staker: Address
	amount: bigint,
	timestamp: number,
	transaction: Address
}

export interface Earning {
	staker: Address
	amount: bigint,
	timestamp: number,
	transaction: Address,
	pool: string
}

export interface Unstake {
	staker: Address
	amount: bigint,
	timestamp: number,
	transaction: Address
}

export interface PersonalInfo {
	staked: bigint
	profit: bigint
}

export interface ExtendedPoolInfo extends PoolInfo {
	realStaked: bigint
	balance: bigint
}

export interface PoolInfo {
	totalStaked: bigint
	count: number
	totalProfit: bigint,
	address: Address
}

export interface Stat {
	time: number,
	value: number
}

export type StakingType = 'conservative' | 'dynamic'