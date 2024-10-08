import {
	fetchActivePools,
	fetchClaimed,
	fetchEarnings,
	fetchStakeReward,
	fetchStakeStatus,
	fetchStaked,
	fetchStakes,
	fetchTotalBets,
	fetchTotalStakers,
	fetchTotalVolume,
	fetchUnrealizedProfit,
} from '@/src/lib/api/dynamic';
import type { StakeParams } from '@/src/lib/query/conservative';
import type { Earning, ExtendedPoolInfo } from '@/src/lib/types.ts';
import { DynamicStakingPoolContract, PartnerContract } from '@betfinio/abi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { type WriteContractErrorType, type WriteContractReturnType, writeContract } from '@wagmi/core';
import { getTransactionLink } from 'betfinio_app/helpers';
import { fetchTotalStaked } from 'betfinio_app/lib/api/dynamic';
import type { Stake } from 'betfinio_app/lib/types';
import { getBlockByTimestamp } from 'betfinio_app/lib/utils';
import { type SupabaseClient, useSupabase } from 'betfinio_app/supabase';
import { toast } from 'betfinio_app/use-toast';
import { useTranslation } from 'react-i18next';
import type { Address } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { type Config, useConfig } from 'wagmi';

const starts = [1715601600];

for (let i = 0; i <= 80; i++) {
	starts.push(starts[starts.length - 1] + 2419200);
}

export const useTotalStakedDiff = () => {
	const { client } = useSupabase();
	const config = useConfig();
	return useQuery({
		queryKey: ['staking', 'dynamic', 'totalStaked', 'diff'],
		queryFn: () => fetchTotalStakedDiff(client, config),
	});
};

export const useUnrealizedProfit = () => {
	const config = useConfig();
	return useQuery({
		queryKey: ['staking', 'dynamic', 'profit', 'unrealized'],
		queryFn: () => fetchUnrealizedProfit(config),
	});
};

export const fetchTotalStakedDiff = async (supabase: SupabaseClient | undefined, config: Config): Promise<bigint[]> => {
	if (!supabase) throw new Error('Supabase client is not defined');
	const cycleStart = (starts.findLast((e) => e * 1000 < Date.now()) || 0) * 1000;
	const block = await getBlockByTimestamp(Math.floor(cycleStart / 1000), supabase);
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

export const useStaked = (address?: Address) => {
	const config = useConfig();

	return useQuery<bigint>({
		queryKey: ['staking', 'dynamic', 'staked', address],
		queryFn: () => fetchStaked(address, config),
	});
};

export const useClaimed = (address?: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['staking', 'dynamic', 'claimed', address],
		queryFn: () => fetchClaimed(address, config),
	});
};

export const useEarnings = (address: Address) => {
	const { client: supabase } = useSupabase();
	return useQuery<Earning[]>({
		queryKey: ['staking', 'dynamic', 'earnings', address],
		queryFn: () => fetchEarnings(address, { supabase }),
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
	return useQuery<Stake[]>({
		queryKey: ['staking', 'dynamic', 'stakes', address],
		queryFn: () => fetchStakes(address),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};

// mutations

export const useStake = () => {
	const { t } = useTranslation('shared', { keyPrefix: 'errors' });
	const config = useConfig();

	return useMutation<WriteContractReturnType, WriteContractErrorType, StakeParams>({
		mutationKey: ['staking', 'dynamic', 'stake'],
		mutationFn: stake,
		onError: (e) => {
			// @ts-ignore
			const error = e.cause?.reason || 'unknown';
			toast({
				description: t(error),
				variant: 'destructive',
			});
			return t(e.message);
		},
		onSuccess: async (data) => {
			const { update } = toast({
				title: 'Stake is in progress',
				description: 'Transaction is being processed',
				variant: 'loading',
				duration: 10000,
				action: getTransactionLink(data),
			});
			await waitForTransactionReceipt(config.getClient(), { hash: data, confirmations: 3 });
			//await queryClient.invalidateQueries({queryKey:['staking', 'dynamic']})
			update({
				title: 'Staked successful',
				variant: 'default',
				description: 'Transaction has been executed',
				duration: 5000,
			});
		},
	});
};

export const stake = async ({ amount, config }: StakeParams): Promise<WriteContractReturnType> => {
	return await writeContract(config, {
		abi: PartnerContract.abi,
		address: import.meta.env.PUBLIC_PARTNER_ADDRESS,
		functionName: 'stake',
		args: [import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS, amount],
	});
};

export const useDistributeProfit = () => {
	const config = useConfig();
	const { t } = useTranslation('shared', { keyPrefix: 'errors' });

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
			const error = e.cause?.reason || 'unknown';
			toast({
				description: t(error),
				variant: 'destructive',
			});
			return t(e.message);
		},
		onSuccess: async (data) => {
			const { update } = toast({
				title: 'Distribution is in progress',
				description: 'Transaction is being processed',
				variant: 'loading',
				duration: 10000,
				action: getTransactionLink(data),
			});
			await waitForTransactionReceipt(config.getClient(), { hash: data });
			update({
				title: 'Distributed successfully',
				variant: 'default',
				description: 'Transaction has been executed',
				duration: 5000,
			});
		},
	});
};

export const useStakeReward = (address: Address, pool: Address, hash: Address) => {
	const config = useConfig();
	return useQuery({
		queryKey: ['staking', 'dynamic', 'reward', pool, address, hash],
		queryFn: () => fetchStakeReward(address, pool, config),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
};
export const useStakeStatus = (pool: Address) => {
	const config = useConfig();
	return useQuery({
		queryKey: ['staking', 'dynamic', 'status', pool],
		queryFn: () => fetchStakeStatus(pool, config),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
};
