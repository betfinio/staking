import logger from '@/src/config/logger';
import { PUBLIC_BETS_MEMORY_ADDRESS, PUBLIC_DYNAMIC_STAKING_ADDRESS, PUBLIC_ROULETTE_ADDRESS, PUBLIC_TOKEN_ADDRESS } from '@/src/globals';
import type { Earning, ExtendedPoolInfo } from '@/src/lib/types.ts';
import { BetsMemoryABI, DynamicStakingABI, DynamicStakingPoolABI, TokenABI, arrayFrom } from '@betfinio/abi';
import { multicall, readContract } from '@wagmi/core';
import type { Options, Stake } from 'betfinio_app/lib/types';
import type { Address } from 'viem';
import type { Config } from 'wagmi';
import { requestDynamicStakes } from '../../gql/dynamic';

export const fetchPool = async (pool: Address, config: Config): Promise<ExtendedPoolInfo> => {
	logger.start('[dynamic]', 'fetching pool dynamic', pool);
	const data = await multicall(config, {
		contracts: [
			{
				abi: DynamicStakingPoolABI,
				address: pool,
				functionName: 'totalStaked',
			},
			{
				abi: DynamicStakingPoolABI,
				address: pool,
				functionName: 'getStakersCount',
			},
			{
				abi: DynamicStakingPoolABI,
				address: pool,
				functionName: 'realStaked',
			},
			{
				abi: TokenABI,
				address: PUBLIC_TOKEN_ADDRESS,
				functionName: 'balanceOf',
				args: [pool],
			},
		],
	});
	const realStaked = data[2].result as bigint;
	const balance = data[3].result as bigint;
	const totalProfit = balance - realStaked;
	return {
		totalStaked: data[0].result,
		count: Number(data[1].result),
		totalProfit,
		address: pool,
	} as ExtendedPoolInfo;
};

export const fetchTotalVolume = async (config: Config) => {
	logger.start('[dynamic]', 'fetching total volume dynamic');
	return await readContract(config, {
		abi: BetsMemoryABI,
		address: PUBLIC_BETS_MEMORY_ADDRESS,
		functionName: 'gamesVolume',
		args: [PUBLIC_ROULETTE_ADDRESS],
	});
};

export const fetchUnrealizedProfit = async (config: Config) => {
	logger.start('[dynamic]', 'fetching unrealized profit dynamic');
	const result = await multicall(config, {
		contracts: [
			{
				abi: TokenABI,
				address: PUBLIC_TOKEN_ADDRESS,
				functionName: 'balanceOf',
				args: [PUBLIC_DYNAMIC_STAKING_ADDRESS],
			},
			{
				abi: DynamicStakingABI,
				address: PUBLIC_DYNAMIC_STAKING_ADDRESS,
				functionName: 'realStaked',
			},
		],
	});
	return (result[0].result as bigint) - (result[1].result as bigint);
};

export const fetchStakes = async (address: Address): Promise<Stake[]> => {
	logger.start('[dynamic]', 'fetching stakes dynamic', address);
	if (!address) {
		return [];
	}
	const staked = await requestDynamicStakes(address);
	const stakedByPools = staked.reduce(
		(acc, stake) => {
			if (!acc[stake.pool]) {
				acc[stake.pool] = stake;
			} else {
				acc[stake.pool].amount += stake.amount;
				acc[stake.pool].reward = (stake.reward || 0n) > (acc[stake.pool].reward || 0n) ? stake.reward : acc[stake.pool].reward;
			}
			return acc;
		},
		{} as Record<Address, Stake>,
	);

	if (!staked) return [];
	return Object.values(stakedByPools).map((stake) => {
		const { start, end, amount, staker, pool, reward, hash } = stake;
		return {
			start: start,
			end: end * 60 * 60 * 24 * 7 * 4,
			amount: amount,
			pool,
			staker: staker,
			reward,
			ended: false,
			hash,
		} as Stake;
	});
};

export const fetchActivePools = async (config: Config): Promise<ExtendedPoolInfo[]> => {
	logger.start('[dynamic]', 'fetching active pools dynamic');
	const activePoolsCount = await readContract(config, {
		abi: DynamicStakingABI,
		address: PUBLIC_DYNAMIC_STAKING_ADDRESS,
		functionName: 'getActivePoolCount',
	});
	const pools = await multicall(config, {
		contracts: arrayFrom(Number(activePoolsCount)).map(
			(
				i,
			): {
				abi: typeof DynamicStakingABI;
				address: Address;
				functionName: 'pools';
				args: [number];
			} => ({
				abi: DynamicStakingABI,
				address: PUBLIC_DYNAMIC_STAKING_ADDRESS,
				functionName: 'pools',
				args: [i],
			}),
		),
	});
	return await Promise.all(pools.reverse().map((pool) => fetchPool(pool.result as Address, config)));
};

export const fetchStaked = async (address: Address | undefined, config: Config) => {
	if (!address) {
		return 0n;
	}
	const data = await readContract(config, {
		abi: DynamicStakingABI,
		address: PUBLIC_DYNAMIC_STAKING_ADDRESS,
		functionName: 'staked',
		args: [address],
	});
	return data;
};
export const fetchTotalBets = async (config: Config) => {
	const bets = await readContract(config, {
		abi: BetsMemoryABI,
		address: PUBLIC_BETS_MEMORY_ADDRESS,
		functionName: 'betsCountByStaking',
		args: [PUBLIC_DYNAMIC_STAKING_ADDRESS],
	});
	return Number(bets);
};
export const fetchClaimed = async (address: Address | undefined, config: Config) => {
	if (!address) {
		return 0n;
	}
	const data = await readContract(config, {
		abi: DynamicStakingABI,
		address: PUBLIC_DYNAMIC_STAKING_ADDRESS,
		functionName: 'getClaimed',
		args: [address],
	});
	return data;
};

export const fetchTotalStakers = async (config: Config, block?: bigint) => {
	const data = await readContract(config, {
		abi: DynamicStakingABI,
		address: PUBLIC_DYNAMIC_STAKING_ADDRESS,
		functionName: 'totalStakers',
		blockNumber: block || undefined,
	});
	return Number(data);
};

export const fetchEarnings = async (address: Address, options: Options): Promise<Earning[]> => {
	if (!options.supabase) throw new Error('Supabase not initialized');
	const data = await options.supabase
		.from('dynamic_earnings')
		.select('amount::text, timestamp::text, transaction, member, pool')
		.eq('member', address.toLowerCase())
		.gt('amount', 0)
		.order('timestamp', { ascending: false });

	return (data.data || []).map(
		(e) =>
			({
				pool: e.pool,
				timestamp: Number(e.timestamp),
				staker: e.member,
				transaction: e.transaction,
				amount: BigInt(e.amount),
			}) as Earning,
	);
};

export const fetchStakeReward = async (address: Address, pool: Address, config: Config) => {
	return await readContract(config, {
		abi: DynamicStakingPoolABI,
		address: pool,
		functionName: 'getClaimed',
		args: [address],
	});
};
export const fetchStakeStatus = async (pool: Address, config: Config) => {
	return await readContract(config, {
		abi: DynamicStakingPoolABI,
		address: pool,
		functionName: 'ended',
	});
};

export async function fetchRouletteContribution(config: Config) {
	logger.start('[dynamic]', 'fetching roulette contribution dynamic');
	return (
		((await readContract(config, {
			abi: BetsMemoryABI,
			address: PUBLIC_BETS_MEMORY_ADDRESS,
			functionName: 'gamesVolume',
			args: [PUBLIC_ROULETTE_ADDRESS],
		})) /
			100_00n) *
		3_60n
	);
}
