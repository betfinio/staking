import type {
	Earning,
	ExtendedPoolInfo
} from '@/src/lib/types.ts';
import {
	BetsMemoryContract,
	ConservativeStakingPoolContract,
	DynamicStakingContract,
	DynamicStakingPoolContract,
	TokenContract,
	defaultMulticall,
} from '@betfinio/abi';
import arrayFrom from '@betfinio/hooks/dist/utils';
import {multicall, readContract} from '@wagmi/core';
import {Options, Stake} from 'betfinio_app/lib/types';
import {type Address} from 'viem';
import type {Config} from 'wagmi';

export const fetchPool = async (
	pool: Address,
	config: Config,
): Promise<ExtendedPoolInfo> => {
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

export const fetchStakersPools = async (
	address: Address,
	config: Config,
): Promise<Address[]> => {
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
export const fetchStakes = async (
	address: Address,
	config: Config,
): Promise<Stake[]> => {
	console.log('fetching stakes dynamic', address);
	if (!address) {
		return [];
	}
	const pools = await fetchStakersPools(address, config);
	const poolsStartCycle = await multicall(config, {
		contracts: pools.map((pool) => ({
			abi: DynamicStakingPoolContract.abi,
			address: pool,
			functionName: 'startCycle',
		})),
	});
	const poolsEndCycle = await multicall(config, {
		contracts: pools.map((pool) => ({
			abi: DynamicStakingPoolContract.abi,
			address: pool,
			functionName: 'endCycle',
		})),
	});
	const stakes = (await multicall(config, {
		contracts: pools.map((pool) => ({
			abi: DynamicStakingPoolContract.abi,
			address: pool,
			functionName: 'getStake',
			args: [address],
		})),
	})) as any[];
	
	const rewards = (await multicall(config, {
		multicallAddress: defaultMulticall,
		contracts: pools.map((pool) => ({
			abi: DynamicStakingPoolContract.abi,
			address: pool,
			functionName: 'getClaimed',
			args: [address],
		})),
	})) as any[];
	
	return stakes
		.map((e) => e.result)
		.map((stake, i) => {
			const [amount, staker] = stake as [bigint, string];
			const start = poolsStartCycle[i].result as bigint;
			const end = poolsEndCycle[i].result as bigint;
			return {
				start: Number(start * 60n * 60n * 24n * 7n * 4n),
				end: Number(end * 60n * 60n * 24n * 7n * 4n),
				amount: amount,
				pool: pools[i],
				staker: staker,
				reward: rewards[i].result,
				ended: false,
			} as Stake;
		})
		.reverse();
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
	return await Promise.all(
		pools.reverse().map((pool) => fetchPool(pool.result as Address, config)),
	);
};

export const fetchStaked = async (
	address: Address,
	config: Config,
): Promise<bigint> => {
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
export const fetchClaimed = async (
	address: Address,
	config: Config,
): Promise<bigint> => {
	const data = await readContract(config, {
		abi: DynamicStakingContract.abi,
		address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS,
		functionName: 'getClaimed',
		args: [address],
	});
	return data as bigint;
};

export const fetchTotalStakers = async (
	config: Config,
	block?: bigint,
): Promise<number> => {
	const data = await readContract(config, {
		abi: DynamicStakingContract.abi,
		address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS,
		functionName: 'totalStakers',
		blockNumber: block || undefined,
	});
	return Number(data);
};

export const fetchCurrentPool = async (config: Config): Promise<string> => {
	console.log('fetching current pool dynamic');
	return (await readContract(config, {
		abi: DynamicStakingContract.abi,
		address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS,
		functionName: 'currentPool',
	})) as string;
};

export const fetchEarnings = async (address: Address, options: Options): Promise<Earning[]> => {
	const data = await options.supabase!
		.from('dynamic_earnings')
		.select("amount::text, timestamp::text, transaction, member, pool")
		.eq("member", address.toLowerCase())
		.gt("amount", 0)
		.order('timestamp', {ascending: true});
	console.log(data)
	
	return (data.data || []).map((e) => ({
		pool: e.pool,
		timestamp: Number(e.timestamp),
		staker: e.member,
		transaction: e.transaction,
		amount: BigInt(e.amount),
	} as Earning))
	
};