import type { Earning, ExtendedPoolInfo } from '@/src/lib/types.ts';
import { BetsMemoryContract, DynamicStakingContract, DynamicStakingPoolContract, TokenContract, arrayFrom, defaultMulticall } from '@betfinio/abi';
import { multicall, readContract } from '@wagmi/core';
import type { Options, Stake } from 'betfinio_app/lib/types';
import type { Address } from 'viem';
import type { Config } from 'wagmi';
import { requestDynamicStakes } from '../../gql/dynamic';

export const fetchPool = async (pool: Address, config: Config): Promise<ExtendedPoolInfo> => {
	console.log('fetching pool dynamic', pool);
	const data = await multicall(config, {
		contracts: [
			{
				abi: DynamicStakingPoolContract.abi,
				address: pool,
				functionName: 'totalStaked',
			},
			{
				abi: DynamicStakingPoolContract.abi,
				address: pool,
				functionName: 'getStakersCount',
			},
			{
				abi: DynamicStakingPoolContract.abi,
				address: pool,
				functionName: 'realStaked',
			},
			{
				abi: TokenContract.abi,
				address: import.meta.env.PUBLIC_TOKEN_ADDRESS,
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

export const fetchTotalVolume = async (config: Config): Promise<bigint> => {
	console.log('fetching total volume dynamic');
	return (await readContract(config, {
		abi: BetsMemoryContract.abi,
		address: import.meta.env.PUBLIC_BETS_MEMORY_ADDRESS,
		functionName: 'gamesVolume',
		args: [import.meta.env.PUBLIC_ROULETTE_ADDRESS],
	})) as bigint;
};

export const fetchUnrealizedProfit = async (config: Config): Promise<bigint> => {
	console.log('fetching unrealized profit dynamic');
	const result = await multicall(config, {
		contracts: [
			{
				abi: TokenContract.abi,
				address: import.meta.env.PUBLIC_TOKEN_ADDRESS,
				functionName: 'balanceOf',
				args: [import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS],
			},
			{
				abi: DynamicStakingContract.abi,
				address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS,
				functionName: 'realStaked',
			},
		],
	});
	return (result[0].result as bigint) - (result[1].result as bigint);
};

export const fetchStakersPools = async (address: Address, config: Config): Promise<Address[]> => {
	const poolsCount = await readContract(config, {
		abi: DynamicStakingContract.abi,
		address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS,
		functionName: 'getStakedPoolsCount',
		args: [address],
	});
	return (await Promise.all(
		arrayFrom(Number(poolsCount)).map((i) =>
			readContract(config, {
				abi: DynamicStakingContract.abi,
				address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS,
				functionName: 'stakedPools',
				args: [address, i],
			}),
		),
	)) as Address[];
};
export const fetchStakes = async (address: Address, config: Config): Promise<Stake[]> => {
	console.log('fetching stakes dynamic', address);
	if (!address) {
		return [];
	}

	const staked = await requestDynamicStakes(address);



	if (!staked) return [];
	return staked.map((stake) => {
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
	console.log('fetching active pools dynamic');
	const activePoolsCount = (await readContract(config, {
		abi: DynamicStakingContract.abi,
		address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS,
		functionName: 'getActivePoolCount',
	})) as number;
	const pools = await multicall(config, {
		contracts: arrayFrom(Number(activePoolsCount)).map((i) => ({
			abi: DynamicStakingContract.abi,
			address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS,
			functionName: 'pools',
			args: [i],
		})),
	});
	return await Promise.all(pools.reverse().map((pool) => fetchPool(pool.result as Address, config)));
};

export const fetchStaked = async (address: Address | undefined, config: Config): Promise<bigint> => {
	if (!address) {
		return 0n;
	}
	const data = await readContract(config, {
		abi: DynamicStakingContract.abi,
		address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS,
		functionName: 'staked',
		args: [address],
	});
	return data as bigint;
};
export const fetchTotalBets = async (config: Config): Promise<number> => {
	const bets = (await readContract(config, {
		abi: BetsMemoryContract.abi,
		address: import.meta.env.PUBLIC_BETS_MEMORY_ADDRESS,
		functionName: 'betsCountByStaking',
		args: [import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS],
	})) as number;
	return Number(bets);
};
export const fetchClaimed = async (address: Address | undefined, config: Config): Promise<bigint> => {
	if (!address) {
		return 0n;
	}
	const data = await readContract(config, {
		abi: DynamicStakingContract.abi,
		address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS,
		functionName: 'getClaimed',
		args: [address],
	});
	return data as bigint;
};

export const fetchTotalStakers = async (config: Config, block?: bigint): Promise<number> => {
	const data = await readContract(config, {
		abi: DynamicStakingContract.abi,
		address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS,
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
	console.log(data);

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
	const reward = (await readContract(config, {
		abi: DynamicStakingPoolContract.abi,
		address: pool,
		functionName: 'getClaimed',
		args: [address],
	})) as bigint;
	return reward;
};
export const fetchStakeStatus = async (pool: Address, config: Config) => {
	const status = (await readContract(config, {
		abi: DynamicStakingPoolContract.abi,
		address: pool,
		functionName: 'ended',
	})) as boolean;
	return status;
};
