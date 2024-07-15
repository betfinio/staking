export interface Stake {
	start: number
	end: number
	staker: string
	pool: string
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
	staker: string
	amount: bigint,
	timestamp: number,
	transaction: string
}

export interface Earning {
	staker: string
	amount: bigint,
	timestamp: number,
	transaction: string,
	pool: string
}

export interface Unstake {
	staker: string
	amount: bigint,
	timestamp: number,
	transaction: string
}

export interface PersonalInfo {
	staked: bigint
	profit: bigint
}

export interface DynamicPoolInfo {
	totalStaked: bigint
	realStaked: bigint
	count: number,
	totalProfit: bigint
	balance: bigint
}

export interface ConservativePoolInfo {
	totalStaked: bigint
	count: number
	totalProfit: bigint
}

export interface Stat {
	time: number,
	value: number
}

export type StakingType = 'conservative' | 'dynamic'