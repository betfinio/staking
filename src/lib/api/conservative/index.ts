import {Address} from "viem";
import {Config} from "wagmi";
import {ConservativePoolInfo, Earning, Stake} from "@/src/lib/types.ts";
import {multicall, readContract} from "@wagmi/core";
import {BetsMemoryContract, ConservativeStakingContract, ConservativeStakingPoolContract, defaultMulticall, ZeroAddress} from "@betfinio/abi";
import arrayFrom from "@betfinio/hooks/dist/utils";
import {getContractEvents} from "viem/actions";
import {getBlockByTimestamp, getTimeByBlock} from "betfinio_app/lib/utils";
import {SupabaseClient} from "@supabase/supabase-js";
import {fetchBalance} from "betfinio_app/lib/api/token";

export const fetchUnstakeLogs = async () => {
	// todo
	return []
}


export const fetchPool = async (pool: Address, config: Config): Promise<ConservativePoolInfo> => {
	console.log('fetching pool conservative', pool)
	const totalStaked = await readContract(config, {
		abi: ConservativeStakingPoolContract.abi,
		address: pool,
		functionName: 'totalStaked'
	}) as bigint
	const stakersCount = await readContract(config, {
		abi: ConservativeStakingPoolContract.abi,
		address: pool,
		functionName: 'getStakersCount'
	}) as number
	const totalProfit = await readContract(config, {
		abi: ConservativeStakingPoolContract.abi,
		address: pool,
		functionName: 'totalProfit'
	}) as bigint
	return {totalStaked, count: Number(stakersCount), totalProfit} as ConservativePoolInfo
}
export const fetchTotalVolume = async (config: Config): Promise<bigint> => {
	console.log('fetching total volume conservative')
	return await readContract(config, {
		abi: BetsMemoryContract.abi,
		address: import.meta.env.PUBLIC_BETS_MEMORY_ADDRESS as Address,
		functionName: 'gamesVolume',
		args: [import.meta.env.PUBLIC_PREDICT_ADDRESS as Address]
	}) as bigint
	
}
export const fetchCurrentPool = async (config: Config): Promise<string> => {
	console.log('fetching current pool conservative')
	return await readContract(config, {
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'currentPool'
	}) as string
}

export const fetchConservativePools = async (config: Config): Promise<string[]> => {
	console.log('fetching pools conservative')
	const count = await readContract(config, {
		abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'getActivePoolCount'
	}) as number
	if (count === 0) {
		return []
	}
	const pools = await multicall(config, {
		contracts: arrayFrom(Number(count)).map(i => ({
			abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
			functionName: 'pools',
			args: [i]
		}))
	})
	return pools.map(e => e.result as string).reverse()
}
export const fetchConservativeEarnings = async (address: Address, config: Config): Promise<Earning[]> => {
	const pools = await fetchStakersPools(address, config);
	console.log('fetching earnings conservative', address)
	return (await Promise.all(pools.map(async (pool) => {
		const logs = await getContractEvents(config.getClient(), {
			...ConservativeStakingPoolContract,
			address: pool,
			eventName: 'NewClaimable',
			toBlock: 'latest',
			strict: true,
			fromBlock: 0n,
			args: {
				staker: [address]
			},
		})
		return await Promise.all(logs.map(async log => {
			const timestamp = await getTimeByBlock(log.blockNumber, config)
			return {
				staker: address,
				timestamp: timestamp,
				pool: pool,
				transaction: log.transactionHash,
				// @ts-ignore
				amount: BigInt(log.args.amount)
			} as Earning
		}))
	}))).flat().sort((a, b) => b.timestamp - a.timestamp).filter(e => e.amount !== 0n)
}


export const fetchProfit = async (address: Address, config: Config): Promise<bigint> => {
	console.log('fetching profit conservative', address)
	return await readContract(config, {
		abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'getProfit',
		args: [address]
	}) as bigint
}

export const fetchClaimable = async (address: Address, config: Config): Promise<bigint> => {
	if (address === ZeroAddress) return 0n;
	console.log('fetching claimable conservative', address)
	return await readContract(config, {
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'getClaimable',
		args: [address]
	}) as bigint
}

export const fetchTotalBets = async (config: Config): Promise<number> => {
	console.log('fetching total bets conservative')
	const bets = await readContract(config, {
		abi: BetsMemoryContract.abi,
		address: import.meta.env.PUBLIC_BETS_MEMORY_ADDRESS as Address,
		functionName: 'betsCountByStaking',
		args: [import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address]
	}) as number
	return Number(bets);
}

export const fetchStaked = async (address: Address, config: Config): Promise<bigint> => {
	console.log('fetching staked conservative', address)
	return await readContract(config, {
		abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'staked',
		args: [address]
	}) as bigint
}

export const fetchTotalStakedDiff = async (start: number, supabase: SupabaseClient, config: Config): Promise<bigint[]> => {
	// @ts-ignore
	const block = await getBlockByTimestamp(start, supabase)
	console.log(block, start)
	try {
		const stakedNow = await fetchTotalStaked(config);
		const stakedThen = await fetchTotalStaked(config, block);
		const stakersNow = await fetchTotalStakers(config);
		const stakersThen = await fetchTotalStakers(config, block);
		return [stakedNow - stakedThen, BigInt(stakersNow - stakersThen)]
	} catch (e) {
		return [0n, 0n]
	}
}

export const fetchTotalProfitDiff = async (config: Config): Promise<bigint[]> => {
	try {
		const profitNow = await fetchBalance(import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address, {config});
		const totalProfit = await fetchTotalProfit(config);
		return [profitNow, totalProfit]
	} catch (e) {
		return [0n, 0n]
	}
}

export const fetchTotalStaked = async (config: Config, block?: bigint): Promise<bigint> => {
	console.log('fetching total staked conservative')
	return await readContract(config, {
		abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: "totalStaked",
		blockNumber: block || undefined
	}) as bigint;
}
export const fetchTotalStakers = async (config: Config, block?: bigint): Promise<number> => {
	console.log('fetching total stakers conservative')
	const data = await readContract(config, {
		abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: "totalStakers",
		blockNumber: block || undefined
	});
	return Number(data);
}

export const fetchStakersPools = async (address: Address, config: Config): Promise<Address[]> => {
	const poolsCount = await readContract(config, {
		abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'getStakedPoolsCount',
		args: [address],
	})
	return await Promise.all(arrayFrom(Number(poolsCount)).map((i) => readContract(config, {
		abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'stakedPools',
		args: [address, i],
	}))) as Address[]
}
export const fetchTotalProfit = async (config: Config, block?: bigint): Promise<bigint> => {
	console.log('fetching total profit conservative')
	return await readContract(config, {
		abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: "totalProfit",
		blockNumber: block || undefined
	}) as bigint;
}

export async function fetchPredictContribution(config: Config): Promise<bigint> {
	console.log('fetching predict contribution conservative')
	return await readContract(config, {
		abi: BetsMemoryContract.abi,
		address: import.meta.env.PUBLIC_BETS_MEMORY_ADDRESS as Address,
		functionName: 'gamesVolume',
		args: [import.meta.env.PUBLIC_PREDICT_ADDRESS as Address]
	}) as bigint / 100_00n * 3_60n
}

export const fetchStakes = async (address: Address, config: Config): Promise<Stake[]> => {
	console.log('fetching stakes conservative', address)
	if (!address) {
		return [];
	}
	const pools = await fetchStakersPools(address, config)
	const stakes = await multicall(config, {
		multicallAddress: defaultMulticall,
		contracts: pools.map(pool => ({
			...ConservativeStakingPoolContract,
			address: pool,
			functionName: 'getStake',
			args: [address]
		}))
	}) as any[]
	
	const rewards = await multicall(config, {
		multicallAddress: defaultMulticall,
		contracts: pools.map(pool => ({
			...ConservativeStakingPoolContract,
			address: pool,
			functionName: 'profit',
			args: [address]
		}))
	}) as any[]
	
	
	return stakes.map(e => e.result).map((stake, i) => {
		const [startDate, unlockDate, amount, staker, ended] = stake as [bigint, bigint, bigint, string, boolean, boolean]
		return {
			start: Number(startDate),
			end: Number(unlockDate),
			amount: amount,
			pool: pools[i],
			reward: rewards[i].result,
			staker: staker,
			ended: ended
		} as Stake
	}).reverse();
}
