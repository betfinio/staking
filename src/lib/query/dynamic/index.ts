import {fetchActivePools, fetchClaimed, fetchEarnings, fetchStaked, fetchStakes, fetchTotalBets, fetchTotalStakers, fetchTotalVolume,} from '@/src/lib/api/dynamic';
import type {StakeParams} from '@/src/lib/query/conservative';
import type {Earning, ExtendedPoolInfo,} from '@/src/lib/types.ts';
import {DynamicStakingPoolContract, PartnerContract} from '@betfinio/abi';
import {useMutation, useQuery} from '@tanstack/react-query';
import {writeContract, type WriteContractErrorType, type WriteContractReturnType} from '@wagmi/core';
import {getBlockByTimestamp} from 'betfinio_app/lib/utils';
import {type SupabaseClient, useSupabase} from 'betfinio_app/supabase';
import {useTranslation} from 'react-i18next';
import type {Address} from 'viem';
import {type Config, useConfig} from 'wagmi';
import {waitForTransactionReceipt} from "viem/actions";
import {toast} from "betfinio_app/use-toast";
import {getTransactionLink} from 'betfinio_app/helpers'
import {fetchTotalStaked} from "betfinio_app/lib/api/dynamic";
import {Stake} from 'betfinio_app/lib/types';

const starts = [1715601600];

for (let i = 0; i <= 80; i++) {
	starts.push(starts[starts.length - 1] + 2419200);
}

export const useTotalStakedDiff = () => {
	const {client} = useSupabase();
	const config = useConfig();
	return useQuery({
		queryKey: ['staking', 'dynamic', 'totalStaked', 'diff'],
		queryFn: () => fetchTotalStakedDiff(client!, config),
	});
};

export const fetchTotalStakedDiff = async (
	supabase: SupabaseClient,
	config: Config,
): Promise<bigint[]> => {
	const cycleStart = starts.findLast((e) => e * 1000 < Date.now())! * 1000;
	const block = await getBlockByTimestamp(
		Math.floor(cycleStart / 1000),
		supabase,
	);
	try {
		const stakedNow = await fetchTotalStaked(config);
		const stakedThen = await fetchTotalStaked(config, block);
		const stakersNow = await fetchTotalStakers(config);
		const stakersThen = await fetchTotalStakers(config, block);
		console.log(stakedNow, stakedThen, stakersNow, stakersThen);
		return [stakedNow - stakedThen, BigInt(stakersNow - stakersThen)];
	} catch (e) {
		return [0n, 0n];
	}
};


export const useActivePools = () => {
	const config = useConfig();
	return useQuery<ExtendedPoolInfo[]>({
		queryKey: ['staking', 'dynamic', 'pools'],
		queryFn: () => fetchActivePools(config),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};


export const useTotalStakers = () => {
	const config = useConfig();
	return useQuery<number>({
		queryKey: ['staking', 'dynamic', 'totalStakers'],
		queryFn: () => fetchTotalStakers(config),
	});
};

export const useStaked = (address: Address) => {
	const config = useConfig();
	
	return useQuery<bigint>({
		queryKey: ['staking', 'dynamic', 'staked', address],
		queryFn: () => fetchStaked(address, config),
	});
};

export const useClaimed = (address: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['staking', 'dynamic', 'claimed', address],
		queryFn: () => fetchClaimed(address, config),
	});
};

export const useEarnings = (address: Address) => {
	const {client: supabase} = useSupabase();
	return useQuery<Earning[]>({
		queryKey: ['staking', 'dynamic', 'earnings', address],
		queryFn: () => fetchEarnings(address, {supabase}),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
};

export const useTotalVolume = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['staking', 'dynamic', 'totalVolume'],
		queryFn: () => fetchTotalVolume(config),
	});
};

export const useTotalBets = () => {
	const config = useConfig();
	return useQuery<number>({
		queryKey: ['staking', 'dynamic', 'totalBets'],
		queryFn: () => fetchTotalBets(config),
	});
};
export const useStakes = (address: Address) => {
	const config = useConfig();
	return useQuery<Stake[]>({
		queryKey: ['staking', 'dynamic', 'stakes', address],
		queryFn: () => fetchStakes(address, config),
	});
};

// mutations

export const useStake = () => {
	const {t} = useTranslation('', {keyPrefix: 'errors'});
	const config = useConfig()
	return useMutation<WriteContractReturnType, any, StakeParams>({
		mutationKey: ['staking', 'dynamic', 'stake'],
		mutationFn: stake,
		onError: (e) => {
			console.log(e, e.cause, e.cause.reason)
			// @ts-ignore
			const error = e.cause && e.cause.reason || "unknown"
			toast({
				title: "An error occurred",
				description: t(error),
				variant: "destructive"
			})
			return t(e.message);
		},
		onSuccess: async (data) => {
			const {update} = toast({
				title: "Stake is in progress",
				description: "Transaction is being processed",
				variant: "loading",
				duration: 10000,
				action: getTransactionLink(data)
			})
			await waitForTransactionReceipt(config.getClient(), {hash: data})
			update({
				title: "Staked successful",
				variant: "default",
				description: "Transaction has been executed",
				duration: 5000
			})
			console.log('staked', data);
		},
	});
};

export const stake = async ({
	amount,
	config,
}: StakeParams): Promise<WriteContractReturnType> => {
	console.log('staking', amount);
	return await writeContract(config, {
		abi: PartnerContract.abi,
		address: import.meta.env.PUBLIC_PARTNER_ADDRESS,
		functionName: 'stake',
		args: [import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS, amount],
	});
};


export const useDistributeProfit = () => {
	const config = useConfig();
	const {t} = useTranslation('', {keyPrefix: 'shared.errors'});
	
	return useMutation<WriteContractReturnType, WriteContractErrorType, Address>({
		mutationKey: ['staking', 'dynamic', 'distributeProfit'],
		mutationFn: async (pool: Address) => {
			return await writeContract(config, {
				abi: DynamicStakingPoolContract.abi,
				address: pool,
				functionName: 'distributeProfit',
			});
		},
		onError: (e) => {
			// @ts-ignore
			const error = e.cause && e.cause['reason'] || "unknown"
			toast({
				title: "An error occurred",
				description: t(error),
				variant: "destructive"
			})
			return t(e.message);
		},
		onSuccess: async (data) => {
			const {update} = toast({
				title: "Distribution is in progress",
				description: "Transaction is being processed",
				variant: "loading",
				duration: 10000,
				action: getTransactionLink(data)
			})
			await waitForTransactionReceipt(config.getClient(), {hash: data})
			update({
				title: "Distributed successfully",
				variant: "default",
				description: "Transaction has been executed",
				duration: 5000
			})
			console.log('staked', data);
		},
	})
}
