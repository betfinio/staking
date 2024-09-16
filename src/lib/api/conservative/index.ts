import logger from '@/src/config/logger';
import type { Earning, ExtendedPoolInfo } from '@/src/lib/types.ts';
import { BetsMemoryContract, ConservativeStakingContract, ConservativeStakingPoolContract, ZeroAddress, arrayFrom, valueToNumber } from '@betfinio/abi';
import { multicall, readContract } from '@wagmi/core';
import { fetchTotalStaked } from 'betfinio_app/lib/api/conservative';
import { fetchBalance } from 'betfinio_app/lib/api/token';
import type { Claim, Options, Stake, Stat, Timeframe } from 'betfinio_app/lib/types';
import { getBlockByTimestamp } from 'betfinio_app/lib/utils';
import type { SupabaseClient } from 'betfinio_app/supabase';
import { DateTime } from 'luxon';
import type { Address } from 'viem';
import type { Config } from 'wagmi';
import { requestConservativeClaims, requestConservativeStakes } from '../../gql/conservative';

export const fetchPool = async (pool: Address, config: Config): Promise<ExtendedPoolInfo> => {
	console.log('fetching pool conservative', pool);
	const totalStaked = (await readContract(config, {
		abi: ConservativeStakingPoolContract.abi,
		address: pool,
		functionName: 'totalStaked',
	})) as bigint;
	const stakersCount = (await readContract(config, {
		abi: ConservativeStakingPoolContract.abi,
		address: pool,
		functionName: 'getStakersCount',
	})) as number;
	const totalProfit = (await readContract(config, {
		abi: ConservativeStakingPoolContract.abi,
		address: pool,
		functionName: 'totalProfit',
	})) as bigint;
	return {
		totalStaked,
		count: Number(stakersCount),
		totalProfit,
		address: pool,
	} as ExtendedPoolInfo;
};
export const fetchTotalVolume = async (config: Config): Promise<bigint> => {
	console.log('fetching total volume conservative');
	const predict = (await readContract(config, {
		abi: BetsMemoryContract.abi,
		address: import.meta.env.PUBLIC_BETS_MEMORY_ADDRESS as Address,
		functionName: 'gamesVolume',
		args: [import.meta.env.PUBLIC_PREDICT_ADDRESS as Address],
	})) as bigint;
	const luro = (await readContract(config, {
		abi: BetsMemoryContract.abi,
		address: import.meta.env.PUBLIC_BETS_MEMORY_ADDRESS as Address,
		functionName: 'gamesVolume',
		args: [import.meta.env.PUBLIC_LUCKY_ROUND_ADDRESS as Address],
	})) as bigint;
	return luro + predict;
};

export const fetchConservativePools = async (config: Config): Promise<ExtendedPoolInfo[]> => {
	console.log('fetching pools conservative');
	const count = (await readContract(config, {
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'getActivePoolCount',
	})) as number;
	if (count === 0) {
		return [];
	}
	const pools = await multicall(config, {
		contracts: arrayFrom(Number(count)).map((i) => ({
			abi: ConservativeStakingContract.abi,
			address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
			functionName: 'pools',
			args: [i],
		})),
	});
	console.log(pools);
	return await Promise.all(pools.reverse().map((pool) => fetchPool(pool.result as Address, config)));
};
export const fetchEarnings = async (address: Address, options: Options): Promise<Earning[]> => {
	if (!options.supabase) throw new Error('Supabase client is not defined');
	const data = await options.supabase
		.from('conservative_earnings')
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

export const fetchClaims = async (address: Address): Promise<Claim[]> => {
	if (!address || address === ZeroAddress) return [];
	return await requestConservativeClaims(address);
};

export const fetchProfit = async (address: Address | undefined, config: Config): Promise<bigint> => {
	console.log('fetching profit conservative', address);
	if (!address) return 0n;
	return (await readContract(config, {
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'getProfit',
		args: [address],
	})) as bigint;
};

export const fetchClaimable = async (address: Address, config: Config): Promise<bigint> => {
	if (address === ZeroAddress) return 0n;
	console.log('fetching claimable conservative', address);
	return (await readContract(config, {
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'getClaimable',
		args: [address],
	})) as bigint;
};

export const fetchTotalBets = async (config: Config): Promise<number> => {
	console.log('fetching total bets conservative');
	const bets = (await readContract(config, {
		abi: BetsMemoryContract.abi,
		address: import.meta.env.PUBLIC_BETS_MEMORY_ADDRESS as Address,
		functionName: 'betsCountByStaking',
		args: [import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address],
	})) as number;
	return Number(bets);
};

export const fetchStaked = async (address: Address | undefined, config: Config): Promise<bigint> => {
	console.log('fetching staked conservative', address);
	if (!address) return 0n;
	return (await readContract(config, {
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'staked',
		args: [address],
	})) as bigint;
};

export const fetchTotalStakedDiff = async (start: number, supabase: SupabaseClient | undefined, config: Config): Promise<bigint[]> => {
	if (!supabase) throw new Error('Supabase client is not defined');
	const block = await getBlockByTimestamp(start, supabase);
	console.log(block, start);
	try {
		const stakedNow = await fetchTotalStaked(config);
		const stakedThen = await fetchTotalStaked(config, block);
		const stakersNow = await fetchTotalStakers(config);
		const stakersThen = await fetchTotalStakers(config, block);
		return [stakedNow - stakedThen, BigInt(stakersNow - stakersThen)];
	} catch (e) {
		return [0n, 0n];
	}
};

export const fetchTotalProfitDiff = async (config: Config): Promise<bigint[]> => {
	try {
		const profitNow = await fetchBalance(import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address, { config });
		const totalProfit = await fetchTotalProfit(config);
		return [profitNow, totalProfit];
	} catch (e) {
		return [0n, 0n];
	}
};

export const fetchTotalStakers = async (config: Config, block?: bigint): Promise<number> => {
	console.log('fetching total stakers conservative');
	const data = await readContract(config, {
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'totalStakers',
		blockNumber: block || undefined,
	});
	return Number(data);
};

export const fetchStakersPools = async (address: Address, config: Config): Promise<Address[]> => {
	const poolsCount = await readContract(config, {
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'getStakedPoolsCount',
		args: [address],
	});
	return (await Promise.all(
		arrayFrom(Number(poolsCount)).map((i) =>
			readContract(config, {
				abi: ConservativeStakingContract.abi,
				address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
				functionName: 'stakedPools',
				args: [address, i],
			}),
		),
	)) as Address[];
};
export const fetchTotalProfit = async (config: Config, block?: bigint): Promise<bigint> => {
	console.log('fetching total profit conservative');
	return (await readContract(config, {
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'totalProfit',
		blockNumber: block || undefined,
	})) as bigint;
};

export async function fetchPredictContribution(config: Config): Promise<bigint> {
	console.log('fetching predict contribution conservative');
	return (
		(((await readContract(config, {
			abi: BetsMemoryContract.abi,
			address: import.meta.env.PUBLIC_BETS_MEMORY_ADDRESS as Address,
			functionName: 'gamesVolume',
			args: [import.meta.env.PUBLIC_PREDICT_ADDRESS as Address],
		})) as bigint) /
			100_00n) *
		3_60n
	);
}

export async function fetchLuroContribution(config: Config): Promise<bigint> {
	console.log('fetching predict contribution conservative');
	return (
		(((await readContract(config, {
			abi: BetsMemoryContract.abi,
			address: import.meta.env.PUBLIC_BETS_MEMORY_ADDRESS as Address,
			functionName: 'gamesVolume',
			args: [import.meta.env.PUBLIC_LUCKY_ROUND_ADDRESS as Address],
		})) as bigint) /
			100_00n) *
		3_60n
	);
}

export const fetchStakes = async (address: Address, config: Config): Promise<Stake[]> => {
	logger.start('[conservative]', 'fetching stakes ', address);
	if (!address) {
		return [];
	}
	const staked = await requestConservativeStakes(address);
	if (!staked) return [];
	return staked;
};

export const fetchCalculationsStat = async (timeframe: Timeframe, options: Options): Promise<Stat[]> => {
	console.log('fetching calculations conservative');
	const fridays = getTenFridaysFrom(getLastFriday())
		.filter((f) => {
			if (timeframe === 'hour' && f.toSeconds() > DateTime.now().toSeconds() - 60 * 60 * 24) {
				return true;
			}
			if (timeframe === 'day' && f.toSeconds() > DateTime.now().toSeconds() - 60 * 60 * 24 * 30) {
				return true;
			}
			if (timeframe === 'week' && f.toSeconds() > DateTime.now().toSeconds() - 60 * 60 * 24 * 30 * 12) {
				return true;
			}
		})
		.map((f) => f.toISO());
	return await Promise.all(fridays.map((f) => fetchOneStat(f, options.supabase)));
};

const fetchOneStat = async (time: string | null, supabase: SupabaseClient | undefined): Promise<Stat> => {
	if (supabase === undefined) throw new Error('Supabase client is not defined');
	if (!time) throw new Error('Time is not defined');
	const data = await supabase
		.from('staking_statistics')
		.select('timestamp::timestamp, revenues::text')
		.eq('staking', import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS.toLowerCase())
		.gt('timestamp', time)
		.order('timestamp', { ascending: true })
		.limit(1);
	if (data.error || !data.data) {
		return { time: DateTime.fromISO(time).toSeconds(), value: 0 };
	}
	return {
		time: Math.floor(DateTime.fromISO(data.data[0].timestamp).toSeconds()),
		value: valueToNumber(BigInt(data.data[0].revenues)),
	};
};

const getLastFriday = () => {
	let lastFriday = DateTime.now().setZone('utc').set({ weekday: 5, hour: 12, minute: 0, second: 0, millisecond: 0 });

	// If it's Friday today, adjust to get the *previous* Friday
	if (lastFriday > DateTime.now()) {
		lastFriday = lastFriday.minus({ weeks: 1 });
	}
	return lastFriday;
};

const getTenFridaysFrom = (friday: DateTime) => {
	const fridays = [];
	for (let i = 0; i < 10; i++) {
		fridays.push(friday.minus({ weeks: i }));
	}
	return fridays;
};

export const fetchStakeReward = async (address: Address, pool: Address, config: Config) => {
	const reward = (await readContract(config, {
		abi: ConservativeStakingPoolContract.abi,
		address: pool,
		functionName: 'profit',
		args: [address],
	})) as bigint;
	return reward;
};
export const fetchStakeStatus = async (address: Address, pool: Address, config: Config) => {
	const status = (await readContract(config, {
		abi: ConservativeStakingPoolContract.abi,
		address: pool,
		functionName: 'getStake',
		args: [address],
	})) as [bigint, bigint, bigint, Address, boolean, boolean];
	return status[4];
};
