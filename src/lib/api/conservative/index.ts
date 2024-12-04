import logger from '@/src/config/logger';
import { PUBLIC_BETS_MEMORY_ADDRESS, PUBLIC_CONSERVATIVE_STAKING_ADDRESS, PUBLIC_LUCKY_ROUND_ADDRESS, PUBLIC_PREDICT_ADDRESS } from '@/src/globals';
import type { Earning, ExtendedPoolInfo, Timeframe } from '@/src/lib/types.ts';
import { BetsMemoryABI, ConservativeStakingABI, ConservativeStakingPoolABI, ZeroAddress, arrayFrom, valueToNumber } from '@betfinio/abi';
import { multicall, readContract } from '@wagmi/core';
import { fetchTotalStaked } from 'betfinio_app/lib/api/conservative';
import { fetchBalance } from 'betfinio_app/lib/api/token';
import { getBlockByTimestamp } from 'betfinio_app/lib/gql';
import type { Claim, Options, Stake, Stat } from 'betfinio_app/lib/types';
import type { SupabaseClient } from 'betfinio_app/supabase';
import { DateTime } from 'luxon';
import type { Address } from 'viem';
import type { Config } from 'wagmi';
import { requestConservativeClaims, requestConservativeStakes } from '../../gql/conservative';

export const fetchPool = async (pool: Address, config: Config) => {
	logger.start('[conservative]', 'fetching pool conservative', pool);
	const totalStaked = await readContract(config, {
		abi: ConservativeStakingPoolABI,
		address: pool,
		functionName: 'totalStaked',
	});
	const stakersCount = await readContract(config, {
		abi: ConservativeStakingPoolABI,
		address: pool,
		functionName: 'getStakersCount',
	});
	const totalProfit = await readContract(config, {
		abi: ConservativeStakingPoolABI,
		address: pool,
		functionName: 'totalProfit',
	});
	return {
		totalStaked,
		count: Number(stakersCount),
		totalProfit,
		address: pool,
	} as ExtendedPoolInfo;
};
export const fetchTotalVolume = async (config: Config) => {
	logger.start('[conservative]', 'fetching total volume conservative');
	const predict = await readContract(config, {
		abi: BetsMemoryABI,
		address: PUBLIC_BETS_MEMORY_ADDRESS,
		functionName: 'gamesVolume',
		args: [PUBLIC_PREDICT_ADDRESS],
	});
	const luro = await readContract(config, {
		abi: BetsMemoryABI,
		address: PUBLIC_BETS_MEMORY_ADDRESS,
		functionName: 'gamesVolume',
		args: [PUBLIC_LUCKY_ROUND_ADDRESS],
	});
	return luro + predict;
};

export const fetchConservativePools = async (config: Config): Promise<ExtendedPoolInfo[]> => {
	logger.start('[conservative]', 'fetching pools conservative');
	const count = await readContract(config, {
		abi: ConservativeStakingABI,
		address: PUBLIC_CONSERVATIVE_STAKING_ADDRESS,
		functionName: 'getActivePoolCount',
	});
	if (count === 0n) {
		return [];
	}
	const pools = await multicall(config, {
		contracts: arrayFrom(Number(count)).map(
			(
				i,
			): {
				abi: typeof ConservativeStakingABI;
				address: Address;
				functionName: 'pools';
				args: [number];
			} => ({
				abi: ConservativeStakingABI,
				address: PUBLIC_CONSERVATIVE_STAKING_ADDRESS,
				functionName: 'pools',
				args: [i],
			}),
		),
	});
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
	logger.start('[conservative]', 'fetching profit conservative', address);
	if (!address) return 0n;
	return await readContract(config, {
		abi: ConservativeStakingABI,
		address: PUBLIC_CONSERVATIVE_STAKING_ADDRESS,
		functionName: 'getProfit',
		args: [address],
	});
};

export const fetchClaimable = async (address: Address, config: Config) => {
	if (address === ZeroAddress) return 0n;
	logger.start('[conservative]', 'fetching claimable conservative', address);
	return await readContract(config, {
		abi: ConservativeStakingABI,
		address: PUBLIC_CONSERVATIVE_STAKING_ADDRESS,
		functionName: 'getClaimable',
		args: [address],
	});
};

export const fetchTotalBets = async (config: Config) => {
	logger.start('[conservative]', 'fetching total bets conservative');
	const bets = await readContract(config, {
		abi: BetsMemoryABI,
		address: PUBLIC_BETS_MEMORY_ADDRESS,
		functionName: 'betsCountByStaking',
		args: [PUBLIC_CONSERVATIVE_STAKING_ADDRESS],
	});
	return Number(bets);
};

export const fetchStaked = async (address: Address | undefined, config: Config) => {
	logger.start('[conservative]', 'fetching staked conservative', address);
	if (!address) return 0n;
	return await readContract(config, {
		abi: ConservativeStakingABI,
		address: PUBLIC_CONSERVATIVE_STAKING_ADDRESS,
		functionName: 'staked',
		args: [address],
	});
};

export const fetchTotalStakedDiff = async (start: number, supabase: SupabaseClient | undefined, config: Config) => {
	if (!supabase) throw new Error('Supabase client is not defined');
	const block = await getBlockByTimestamp(start);
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

export const fetchTotalProfitDiff = async (config: Config) => {
	try {
		const profitNow = await fetchBalance(PUBLIC_CONSERVATIVE_STAKING_ADDRESS, { config });
		const totalProfit = await fetchTotalProfit(config);
		return [profitNow, totalProfit];
	} catch (e) {
		return [0n, 0n];
	}
};

export const fetchTotalStakers = async (config: Config, block?: bigint) => {
	logger.start('[conservative]', 'fetching total stakers conservative');
	const data = await readContract(config, {
		abi: ConservativeStakingABI,
		address: PUBLIC_CONSERVATIVE_STAKING_ADDRESS,
		functionName: 'totalStakers',
		blockNumber: block || undefined,
	});
	return Number(data);
};

export const fetchStakersPools = async (address: Address, config: Config) => {
	const poolsCount = await readContract(config, {
		abi: ConservativeStakingABI,
		address: PUBLIC_CONSERVATIVE_STAKING_ADDRESS,
		functionName: 'getStakedPoolsCount',
		args: [address],
	});
	return (await Promise.all(
		arrayFrom(Number(poolsCount)).map((i) =>
			readContract(config, {
				abi: ConservativeStakingABI,
				address: PUBLIC_CONSERVATIVE_STAKING_ADDRESS,
				functionName: 'stakedPools',
				args: [address, BigInt(i)],
			}),
		),
	)) as Address[];
};
export const fetchTotalProfit = async (config: Config, block?: bigint) => {
	logger.start('[conservative]', 'fetching total profit conservative');
	return await readContract(config, {
		abi: ConservativeStakingABI,
		address: PUBLIC_CONSERVATIVE_STAKING_ADDRESS,
		functionName: 'totalProfit',
		blockNumber: block || undefined,
	});
};

export async function fetchPredictContribution(config: Config) {
	logger.start('[conservative]', 'fetching predict contribution conservative');
	return (
		((await readContract(config, {
			abi: BetsMemoryABI,
			address: PUBLIC_BETS_MEMORY_ADDRESS,
			functionName: 'gamesVolume',
			args: [PUBLIC_PREDICT_ADDRESS],
		})) /
			100_00n) *
		3_60n
	);
}

export async function fetchLuroContribution(config: Config): Promise<bigint> {
	logger.start('[conservative]', 'fetching predict contribution conservative');
	return (
		((await readContract(config, {
			abi: BetsMemoryABI,
			address: PUBLIC_BETS_MEMORY_ADDRESS,
			functionName: 'gamesVolume',
			args: [PUBLIC_LUCKY_ROUND_ADDRESS],
		})) /
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
	logger.start('[conservative]', 'fetching calculations conservative');
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
		.eq('staking', PUBLIC_CONSERVATIVE_STAKING_ADDRESS.toLowerCase())
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

export const fetchStakeStatus = async (address: Address, pool: Address, config: Config) => {
	const status = await readContract(config, {
		abi: ConservativeStakingPoolABI,
		address: pool,
		functionName: 'getStake',
		args: [address],
	});
	return status[4];
};

export const fetchPoolReward = async (address: Address, pool: Address, config: Config) => {
	return await readContract(config, {
		abi: ConservativeStakingPoolABI,
		address: pool,
		functionName: 'profit',
		args: [address],
	});
};
