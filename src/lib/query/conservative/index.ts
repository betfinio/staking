import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getBlock, readContract, writeContract, WriteContractReturnType} from "@wagmi/core";
import {Config, useConfig, useWatchContractEvent} from "wagmi";
import {Address, decodeEventLog, Log} from "viem";
import {Claim, ConservativePoolInfo, Earning, Stake} from "@/src/lib/types";
import {getContractEvents} from "viem/actions";
import {
	ConservativeStakingContract,
	GameContract,
	PartnerContract,
	TokenContract,
	ZeroAddress
} from "@betfinio/abi";
import {useTranslation} from "react-i18next";
import {useSupabase} from "betfinio_app/supabase";
import {
	fetchClaimable, fetchConservativeEarnings, fetchConservativePools, fetchCurrentPool, fetchPool,
	fetchPredictContribution, fetchProfit, fetchStaked, fetchStakes,
	fetchTotalBets,
	fetchTotalProfit,
	fetchTotalProfitDiff,
	fetchTotalStaked, fetchTotalStakedDiff,
	fetchTotalStakers,
	fetchTotalVolume, fetchUnstakeLogs
} from "@/src/lib/api/conservative";


export const useTotalStaked = () => {
	const queryClient = useQueryClient();
	const config = useConfig()
	useWatchContractEvent({
		abi: ConservativeStakingContract.abi,
		eventName: 'Staked',
		onLogs: async () => {
			await queryClient.invalidateQueries({queryKey: ['staking', 'conservative', 'totalStaked']})
			await queryClient.invalidateQueries({queryKey: ['staking', 'conservative', 'totalStakers']})
		}
	})
	useWatchContractEvent({
		abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		eventName: 'Withdraw',
		onLogs: async () => {
			await queryClient.invalidateQueries({queryKey: ['staking', 'conservative', 'totalStaked']})
			await queryClient.invalidateQueries({queryKey: ['staking', 'conservative', 'totalStakers']})
		}
	})
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'totalStaked'],
		queryFn: () => fetchTotalStaked(config),
	})
}

export const useTotalProfitWithBalance = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'totalProfitWithBalance'],
		queryFn: async () => {
			const profit = await fetchTotalProfit(config)
			const staked = await fetchTotalStaked(config)
			const balance = await readContract(config, {
				abi: TokenContract.abi,
				address: import.meta.env.PUBLIC_TOKEN_ADDRESS as Address,
				functionName: 'balanceOf',
				args: [import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address]
			}) as bigint
			return profit + balance - staked
		}
	})
	
}
export const usePredictContribution = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'predictContribution'],
		queryFn: () => fetchPredictContribution(config),
		initialData: 0n
	})
}
export const useTotalStakers = () => {
	const config = useConfig()
	return useQuery<number>({
		queryKey: ['staking', 'conservative', 'totalStakers'],
		queryFn: () => fetchTotalStakers(config)
	})
}

export const useTotalProfit = () => {
	const config = useConfig()
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'totalProfit'],
		queryFn: () => fetchTotalProfit(config)
	})
}

export const useTotalVolume = () => {
	const config = useConfig()
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'totalVolume'],
		queryFn: () => fetchTotalVolume(config)
	})
}

export const useTotalStakedDiff = (start: number) => {
	const {client} = useSupabase()
	const config = useConfig();
	return useQuery({
		queryKey: ['staking', 'conservative', 'totalStaked', 'diff', start],
		//@ts-ignore
		queryFn: () => fetchTotalStakedDiff(start, client!, config)
	})
}

export const useTotalProfitDiff = () => {
	const config = useConfig();
	return useQuery({
		queryKey: ['staking', 'conservative', 'totalProfit', 'diff'],
		queryFn: () => fetchTotalProfitDiff(config)
	})
}

export const useTotalBets = () => {
	const queryClient = useQueryClient();
	const config = useConfig()
	useWatchContractEvent({
		abi: GameContract.abi,
		address: import.meta.env.PUBLIC_BTCUSDT_GAME_ADDRESS as Address,
		eventName: 'BetCreated',
		onLogs: async () => {
			await queryClient.invalidateQueries({queryKey: ['staking', 'conservative', 'totalBets']})
			await queryClient.invalidateQueries({queryKey: ['balance', import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address]})
		}
	})
	return useQuery<number>({
		queryKey: ['staking', 'conservative', 'totalBets'],
		queryFn: () => fetchTotalBets(config)
	})
}

export const useClaimable = (address: Address) => {
	const config = useConfig()
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'claimable', address],
		queryFn: () => fetchClaimable(address, config),
	})
}

export const useStaked = (address: Address) => {
	const queryClient = useQueryClient();
	const config = useConfig()
	useWatchContractEvent({
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		eventName: 'Staked',
		onLogs: async (log: Log[]) => {
			const event = decodeEventLog({
				abi: ConservativeStakingContract.abi,
				...log[0],
				strict: true
			})
			const {staker} = event.args as unknown as { staker: string }
			if (staker.toLowerCase() === address.toLowerCase()) {
				await queryClient.invalidateQueries({queryKey: ['staking', 'conservative', 'staked', address]})
			}
		}
	})
	useWatchContractEvent({
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		eventName: 'Withdraw',
		onLogs: async (log: Log[]) => {
			const event = decodeEventLog({
				abi: ConservativeStakingContract.abi,
				...log[0],
				strict: true
			})
			const {staker} = event.args as unknown as { staker: string }
			if (staker.toLowerCase() === address.toLowerCase()) {
				await queryClient.invalidateQueries({queryKey: ['staking', 'conservative', 'staked', address]})
				await queryClient.invalidateQueries({queryKey: ['staking', 'conservative', 'stakes', address]})
			}
		}
	})
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'staked', address],
		queryFn: () => fetchStaked(address, config),
	})
}

export const useProfit = (address: Address) => {
	const config = useConfig()
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'profit', address],
		queryFn: () => fetchProfit(address, config),
	})
}

export const useEarnings = (address: Address) => {
	const config = useConfig()
	return useQuery<Earning[]>({
		queryKey: ['staking', 'conservative', 'earnings', address],
		queryFn: () => fetchConservativeEarnings(address, config)
	})
}


export const useStakes = (address: Address) => {
	const queryClient = useQueryClient();
	const config = useConfig()
	useWatchContractEvent({
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		eventName: 'Staked',
		onLogs: async (log: Log[]) => {
			const event = decodeEventLog({
				abi: ConservativeStakingContract.abi,
				...log[0],
				strict: true
			})
			const {staker} = event.args as unknown as { staker: string }
			if (staker.toLowerCase() === address.toLowerCase()) {
				await queryClient.invalidateQueries({queryKey: ['staking', 'conservative', 'stakes', address]})
			}
		}
	})
	return useQuery<Stake[]>({
		queryKey: ['staking', 'conservative', 'stakes', address],
		queryFn: () => fetchStakes(address, config),
	})
}

export const useClaims = (address: Address) => {
	const queryClient = useQueryClient();
	const config = useConfig()
	useWatchContractEvent({
		abi: ConservativeStakingContract.abi,
		address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		eventName: 'Claimed',
		onLogs: async (logs: Log[]) => {
			const event = decodeEventLog({
				abi: ConservativeStakingContract.abi,
				...logs[0],
				strict: true
			})
			const args = event.args as unknown as { staker: string };
			if (args.staker.toLowerCase() === address!.toLowerCase()) {
				await queryClient.invalidateQueries({queryKey: ['staking', 'conservative', 'claims', address]})
				await queryClient.invalidateQueries({queryKey: ['staking', 'conservative', 'claimable', address]})
			}
		}
	})
	
	return useQuery({
		queryKey: ['staking', 'conservative', 'claims', address],
		queryFn: () => fetchClaims(address, config),
	})
}


export const useUnstakes = (address: Address) => {
	return useQuery({
		queryKey: ['withdraw', address],
		queryFn: fetchUnstakeLogs,
	})
}


export const useCurrentPool = () => {
	const config = useConfig();
	return useQuery<string>({
		queryKey: ['staking', 'conservative', 'currentPool'],
		queryFn: () => fetchCurrentPool(config)
	})
}

export const useActivePools = () => {
	const config = useConfig();
	return useQuery<string[]>({
		queryKey: ['staking', 'conservative', 'pools'],
		queryFn: () => fetchConservativePools(config),
	})
}

export const usePool = (pool: Address) => {
	const config = useConfig();
	return useQuery<ConservativePoolInfo>({
		queryKey: ['staking', 'conservative', 'pool', pool],
		queryFn: () => fetchPool(pool, config),
	})
}

// mutations

export type StakeParams = {
	amount: bigint,
	config: Config
}
export type UnstakeParams = {
	pool: string,
	config: Config
}
export const useStake = () => {
	const t = useTranslation('', {keyPrefix: 'staking.errors'})
	return useMutation<WriteContractReturnType, any, StakeParams>({
		mutationKey: ['staking', 'conservative', 'stake'],
		mutationFn: stake,
		onError: (e) => {
			console.error(e)
			return t.t(e.message)
		},
		onMutate: () => console.log('staking'),
		onSuccess: (data) => {
			console.log('staked', data)
		},
		onSettled: () => console.log('staking settled')
	})
}

export const useClaim = () => {
	const t = useTranslation('', {keyPrefix: 'staking.errors'})
	const config = useConfig()
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType>({
		mutationKey: ['staking', 'conservative', 'claim'],
		mutationFn: () => claimAll({config}),
		onError: (e) => {
			console.error(e)
			return t.t(e.message)
		},
		onMutate: () => console.log('claim'),
		onSuccess: async (data) => {
			console.log('claimed', data)
			await queryClient.invalidateQueries({queryKey: ['staking', 'conservative']})
		},
		onSettled: () => console.log('claim settled')
	})
}

export const useUnstake = () => {
	const t = useTranslation('', {keyPrefix: 'staking.errors'})
	return useMutation<WriteContractReturnType, any, UnstakeParams>({
		mutationKey: ['staking', 'conservative', 'unstake'],
		mutationFn: unstake,
		onError: (e) => {
			console.error(e)
			return t.t(e.message)
		},
		onMutate: () => console.log('unstaking'),
		onSuccess: (data) => {
			console.log('unstaked', data)
		},
		onSettled: () => console.log('unstaking settled')
	})
}

export const useCalculateProfit = () => {
	const t = useTranslation('', {keyPrefix: 'staking.errors'})
	const config = useConfig()
	return useMutation<WriteContractReturnType, any, { old: boolean }>({
		mutationKey: ['staking', 'conservative', 'calculateProfit'],
		mutationFn: (e) => calculateProfit({...e, config: config}),
		onError: (e) => {
			console.error(e)
		},
		onMutate: () => console.log('calculating profit'),
		onSuccess: (data) => {
			console.log('profit calculated', data)
		},
		onSettled: () => console.log('profit calculation settled')
	})
}


export async function calculateProfit({old, config}: { old: boolean, config: Config }): Promise<WriteContractReturnType> {
	if (old) {
		return await writeContract(config, {
			abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
			functionName: 'calculateProfit',
			args: [0n, 100n]
		})
	}
	// return await writeContract(config, {
	// 	abi: HelpersContract.abi,
	// 	functionName: 'calculateAndDistribute',
	// 	args: [import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address, 0n, 100n]
	// })
	// todo add helpers contract to abi
	return ZeroAddress;
}

export const stake = async ({amount, config}: StakeParams): Promise<WriteContractReturnType> => {
	console.log('staking', amount)
	return await writeContract(config, {
		abi: PartnerContract.abi,
		address: import.meta.env.PUBLIC_PARTNER_ADDRESS as Address,
		functionName: 'stake',
		args: [import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address, amount]
	})
}
export const claimAll = async ({config}: { config: Config }): Promise<WriteContractReturnType> => {
	return await writeContract(config, {
		abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'claimAll',
	})
}

const unstake = async ({pool, config}: UnstakeParams): Promise<WriteContractReturnType> => {
	console.log('unstaking', pool)
	return await writeContract(config, {
		abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		functionName: 'withdraw',
		args: [pool]
	})
}


export const fetchClaims = async (address: Address, config: Config) => {
	const logss = await getContractEvents(config.getClient(), {
		abi: ConservativeStakingContract.abi, address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
		eventName: 'Claimed',
		fromBlock: 0n,
		toBlock: 'latest',
		args: {
			staker: address
		}
	})
	console.log(logss)
	// todo all events
	return await Promise.all(logss.map(async e => {
		const block = await getBlock(config, {blockNumber: e.blockNumber})
		return {
			// @ts-ignore
			amount: BigInt(e.args['amount']),
			timestamp: Number(block.timestamp),
			// @ts-ignore
			staker: e.args['staker'],
			transaction: e.transactionHash
		} as Claim
	}))
}
