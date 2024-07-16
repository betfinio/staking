import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {writeContract, WriteContractReturnType} from "@wagmi/core";
import {Config, useConfig, useWatchContractEvent} from "wagmi";
import {Address} from "viem";
import {getBlockByTimestamp} from "betfinio_app/lib/utils";
import {useSupabase, SupabaseClient} from "betfinio_app/supabase";
import {DynamicStakingContract, PartnerContract} from "@betfinio/abi";
import {ExtendedPoolInfo, Earning, Stake, Unstake} from "@/src/lib/types.ts";
import {
	fetchActivePools,
	fetchClaimed,
	fetchCurrentPool,
	fetchEarnings,
	fetchPool,
	fetchStaked, fetchStakes, fetchTotalBets,
	fetchTotalProfit,
	fetchTotalStaked,
	fetchTotalStakers, fetchTotalVolume, fetchUnstakes
} from "@/src/lib/api/dynamic";
import {useTranslation} from "react-i18next";
import {StakeParams, UnstakeParams} from "@/src/lib/query/conservative";

const starts = [
	1715601600
]

for (let i = 0; i <= 80; i++) {
	starts.push(starts[starts.length - 1] + 2419200)
}

export const useTotalStakedDiff = () => {
	const {client} = useSupabase()
	const config = useConfig()
	return useQuery({
		queryKey: ['staking', 'dynamic', 'totalStaked', 'diff'],
		queryFn: () => fetchTotalStakedDiff(client!, config)
	})
}


export const fetchTotalStakedDiff = async (supabase: SupabaseClient, config: Config): Promise<bigint[]> => {
	const cycleStart = starts.findLast(e => e * 1000 < Date.now())! * 1000;
	const block = await getBlockByTimestamp(Math.floor(cycleStart / 1000), supabase)
	try {
		const stakedNow = await fetchTotalStaked(config);
		const stakedThen = await fetchTotalStaked(config, block);
		const stakersNow = await fetchTotalStakers(config,);
		const stakersThen = await fetchTotalStakers(config, block);
		console.log(stakedNow, stakedThen, stakersNow, stakersThen)
		return [stakedNow - stakedThen, BigInt(stakersNow - stakersThen)]
	} catch (e) {
		return [0n, 0n]
	}
}

export const useTotalStaked = () => {
	const queryClient = useQueryClient();
	const config = useConfig()
	useWatchContractEvent({
		abi: DynamicStakingContract.abi,
		address: import.meta.env.PUBLIC_DYNAMIC_STAKING_CONTRACT,
		eventName: 'Staked',
		onLogs: async () => {
			await queryClient.invalidateQueries({queryKey: ['staking', 'dynamic']})
		}
	})
	return useQuery<bigint>({
		queryKey: ['staking', 'dynamic', 'totalStaked'],
		queryFn: () => fetchTotalStaked(config)
	})
}

export const useTotalProfit = () => {
	const config = useConfig()
	return useQuery<bigint>({
		queryKey: ['staking', 'dynamic', 'totalProfit'],
		queryFn: () => fetchTotalProfit(config)
	})
}

export const useCurrentPool = () => {
	const config = useConfig()
	
	return useQuery<string>({
		queryKey: ['staking', 'dynamic', 'currentPool'],
		queryFn: () => fetchCurrentPool(config)
	})
}

export const useActivePools = () => {
	const config = useConfig()
	return useQuery<string[]>({
		queryKey: ['staking', 'dynamic', 'pools'],
		queryFn: () => fetchActivePools(config)
	})
}

export function usePool(pool: Address) {
	const config = useConfig()
	
	return useQuery<ExtendedPoolInfo>({
		queryKey: ['staking', 'dynamic', 'pool', pool],
		queryFn: () => fetchPool(pool, config)
	})
}


export const useTotalStakers = () => {
	const config = useConfig()
	return useQuery<number>({
		queryKey: ['staking', 'dynamic', 'totalStakers'],
		queryFn: () => fetchTotalStakers(config)
	})
}

export const useStaked = (address: Address) => {
	const config = useConfig()
	
	return useQuery<bigint>({
		queryKey: ['staking', 'dynamic', 'staked', address],
		queryFn: () => fetchStaked(address, config),
	})
}

export const useClaimed = (address: Address) => {
	const config = useConfig()
	return useQuery<bigint>({
		queryKey: ['staking', 'dynamic', 'claimed', address],
		queryFn: () => fetchClaimed(address, config),
	})
}


export const useEarnings = (address: Address) => {
	const config = useConfig()
	return useQuery<Earning[]>({
		queryKey: ['staking', 'dynamic', 'earnings', address],
		queryFn: () => fetchEarnings(address, config),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
	})
}


export const useUnstakes = (address: Address) => useQuery<Unstake[]>({
	queryKey: ['staking', 'dynamic', 'unstakes', address],
	queryFn: () => fetchUnstakes(),
})
export const useTotalVolume = () => {
	const config = useConfig()
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'totalVolume'],
		queryFn: () => fetchTotalVolume(config)
	})
}

export const useTotalBets = () => {
	const config = useConfig()
	return useQuery<number>({
		queryKey: ['staking', 'dynamic', 'totalBets'],
		queryFn: () => fetchTotalBets(config),
	})
}
export const useStakes = (address: Address) => {
	const config = useConfig()
	return useQuery<Stake[]>({
		queryKey: ['staking', 'dynamic', 'stakes', address],
		queryFn: () => fetchStakes(address, config),
	})
}


// mutations

export const useStake = () => {
	const t = useTranslation('', {keyPrefix: 'errors'})
	return useMutation<WriteContractReturnType, any, StakeParams>({
		mutationKey: ['staking', 'dynamic', 'stake'],
		mutationFn: stake,
		onError: (e) => {
			console.error(e)
		},
		onMutate: () => console.log('staking'),
		onSuccess: (data) => {
			console.log(data)
		},
		onSettled: () => console.log('staking settled')
	})
}

export const useUnstake = () => {
	const t = useTranslation('', {keyPrefix: 'errors'})
	return useMutation<WriteContractReturnType, any, UnstakeParams>({
		mutationKey: ['staking', 'dynamic', 'unstake'],
		mutationFn: unstake,
		onError: (e) => {
			console.error(e)
		},
		onMutate: () => console.log('unstaking'),
		onSuccess: (data) => {
			console.log(data)
		},
		onSettled: () => console.log('unstaking settled')
	})
}

const unstake = async ({pool, config}: UnstakeParams): Promise<WriteContractReturnType> => {
	console.log('unstaking', pool)
	return await writeContract(config, {
		abi: DynamicStakingContract.abi,
		address: import.meta.env.PUBLIC_DYNAMIC_STAKING_CONTRACT,
		functionName: 'withdraw',
		args: [pool]
	})
}

export const stake = async ({amount, config}: StakeParams): Promise<WriteContractReturnType> => {
	console.log('staking', amount)
	return await writeContract(config, {
		abi: PartnerContract.abi,
		address: import.meta.env.PUBLIC_PARTNER_ADDRESS,
		functionName: 'stake',
		args: [import.meta.env.PUBLIC_DYNAMIC_STAKING_CONTRACT, amount]
	})
}