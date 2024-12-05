import { PUBLIC_CONSERVATIVE_STAKING_ADDRESS, PUBLIC_PARTNER_ADDRESS } from '@/src/globals';
import {
	fetchCalculationsStat,
	fetchClaimable,
	fetchClaims,
	fetchConservativePools,
	fetchEarnings,
	fetchLuroContribution,
	fetchPoolReward,
	fetchPredictContribution,
	fetchProfit,
	fetchStakeStatus,
	fetchStaked,
	fetchStakes,
	fetchTotalBets,
	fetchTotalProfit,
	fetchTotalProfitDiff,
	fetchTotalStakedDiff,
	fetchTotalStakers,
	fetchTotalVolume,
} from '@/src/lib/api/conservative';
import type { Earning, ExtendedPoolInfo, Timeframe } from '@/src/lib/types';
import { ConservativeStakingABI, ConservativeStakingPoolABI, PartnerABI } from '@betfinio/abi';
import { toast } from '@betfinio/components/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { WriteContractErrorType } from '@wagmi/core';
import { type WriteContractReturnType, writeContract } from '@wagmi/core';
import { getTransactionLink } from 'betfinio_app/helpers';
import type { Stake, Stat } from 'betfinio_app/lib/types';
import { useSupabase } from 'betfinio_app/supabase';
import { useTranslation } from 'react-i18next';
import type { Address } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { type Config, useConfig, useWatchContractEvent } from 'wagmi';

export const usePredictContribution = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'predictContribution'],
		queryFn: () => fetchPredictContribution(config),
	});
};
export const useLuroContribution = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'luroContribution'],
		queryFn: () => fetchLuroContribution(config),
	});
};
export const useTotalStakers = () => {
	const config = useConfig();
	return useQuery<number>({
		queryKey: ['staking', 'conservative', 'totalStakers'],
		queryFn: () => fetchTotalStakers(config),
	});
};

export const useTotalProfit = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'totalProfit'],
		queryFn: () => fetchTotalProfit(config),
	});
};

export const useTotalVolume = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'totalVolume'],
		queryFn: () => fetchTotalVolume(config),
	});
};

export const useTotalStakedDiff = (start: number) => {
	const { client } = useSupabase();
	const config = useConfig();
	return useQuery({
		queryKey: ['staking', 'conservative', 'totalStaked', 'diff', start],
		queryFn: () => fetchTotalStakedDiff(start, client, config),
	});
};

export const useTotalProfitDiff = () => {
	const config = useConfig();
	return useQuery({
		queryKey: ['staking', 'conservative', 'totalProfit', 'diff'],
		queryFn: () => fetchTotalProfitDiff(config),
	});
};

export const useTotalBets = () => {
	const config = useConfig();

	return useQuery<number>({
		queryKey: ['staking', 'conservative', 'totalBets'],
		queryFn: () => fetchTotalBets(config),
	});
};

export const useClaimable = (address: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'claimable', address],
		queryFn: () => fetchClaimable(address, config),
	});
};

export const useStaked = (address?: Address) => {
	const config = useConfig();

	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'staked', address],
		queryFn: () => fetchStaked(address, config),
	});
};

export const useProfit = (address?: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['staking', 'conservative', 'profit', address],
		queryFn: () => fetchProfit(address, config),
	});
};

export const useEarnings = (address: Address) => {
	const { client: supabase } = useSupabase();
	return useQuery<Earning[]>({
		queryKey: ['staking', 'conservative', 'earnings', address],
		queryFn: () => fetchEarnings(address, { supabase }),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};

export const useStakes = (address: Address) => {
	const config = useConfig();
	return useQuery<Stake[]>({
		queryKey: ['staking', 'conservative', 'stakes', address],
		queryFn: () => fetchStakes(address, config),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};

export const useClaims = (address: Address) => {
	return useQuery({
		queryKey: ['staking', 'conservative', 'claims', address],
		queryFn: () => fetchClaims(address),
	});
};

export const useActivePools = () => {
	const config = useConfig();
	return useQuery<ExtendedPoolInfo[]>({
		queryKey: ['staking', 'conservative', 'pools'],
		queryFn: () => fetchConservativePools(config),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};

// mutations

export type StakeParams = {
	amount: bigint;
	config: Config;
};
export const useStake = () => {
	const { t } = useTranslation('shared', { keyPrefix: 'errors' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType, StakeParams>({
		mutationKey: ['staking', 'conservative', 'stake'],
		mutationFn: stake,
		onError: (e) => {
			// @ts-ignore
			const error = e.cause?.reason || 'unknown';
			toast({
				description: t(error),
				variant: 'destructive',
			});
			return t(e.message as never);
		},
		onSuccess: async (data) => {
			const { update, id } = toast({
				title: 'Stake is in progress',
				description: 'Transaction is being processed',
				variant: 'loading',
				duration: 10000,
				action: getTransactionLink(data),
			});
			await waitForTransactionReceipt(config.getClient(), { hash: data, confirmations: 3 });

			queryClient.invalidateQueries({
				queryKey: ['staking', 'conservative'],
			});
			update({
				id,
				title: 'Staked successful',
				variant: 'default',
				description: 'Transaction has been executed',
				duration: 5000,
			});
		},
	});
};

export const useClaim = () => {
	const { t } = useTranslation('shared', { keyPrefix: 'errors' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType>({
		mutationKey: ['staking', 'conservative', 'claim'],
		mutationFn: () => claimAll({ config }),
		onError: (e) => {
			// @ts-ignore
			const error = e.cause?.reason || 'unknown';
			toast({
				description: t(error),
				variant: 'destructive',
			});
			return t(e.message as never);
		},
		onSuccess: async (data) => {
			const { update, id } = toast({
				title: 'Claim is in progress',
				description: 'Transaction is being processed',
				variant: 'loading',
				duration: 10000,
				action: getTransactionLink(data),
			});
			await waitForTransactionReceipt(config.getClient(), { hash: data });
			await queryClient.invalidateQueries({
				queryKey: ['staking', 'conservative'],
			});
			update({
				id,
				title: 'Claimed successfully',
				variant: 'default',
				description: 'Transaction has been executed',
				duration: 5000,
			});
		},
	});
};

export const stake = async ({ amount, config }: StakeParams): Promise<WriteContractReturnType> => {
	return await writeContract(config, {
		abi: PartnerABI,
		address: PUBLIC_PARTNER_ADDRESS,
		functionName: 'stake',
		args: [PUBLIC_CONSERVATIVE_STAKING_ADDRESS, amount],
	});
};
export const claimAll = async ({ config }: { config: Config }): Promise<WriteContractReturnType> => {
	return await writeContract(config, {
		abi: ConservativeStakingABI,
		address: PUBLIC_CONSERVATIVE_STAKING_ADDRESS,
		functionName: 'claimAll',
	});
};

export const useCalculationsStat = (timeframe: Timeframe) => {
	const config = useConfig();
	const { client: supabase } = useSupabase();
	return useQuery<Stat[]>({
		queryKey: ['staking', 'conservative', 'calculations', 'stat', timeframe],
		queryFn: () => fetchCalculationsStat(timeframe, { config, supabase }),
	});
};

export const useDistributeProfit = () => {
	const config = useConfig();
	const { t } = useTranslation('shared', { keyPrefix: 'errors' });

	return useMutation<WriteContractReturnType, WriteContractErrorType, Address>({
		mutationKey: ['staking', 'conservative', 'distributeProfit'],
		mutationFn: async (pool: Address) => {
			return await writeContract(config, {
				abi: ConservativeStakingPoolABI,
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
		},
		onSuccess: async (data) => {
			const { update, id } = toast({
				title: 'Distribution is in progress',
				description: 'Transaction is being processed',
				variant: 'loading',
				duration: 10000,
				action: getTransactionLink(data),
			});
			await waitForTransactionReceipt(config.getClient(), { hash: data });
			update({
				id,
				title: 'Distributed successfully',
				variant: 'default',
				description: 'Transaction has been executed',
				duration: 5000,
			});
		},
	});
};

export const useStakeStatus = (address: Address, pool: Address, hash: Address) => {
	const config = useConfig();
	return useQuery({
		queryKey: ['staking', 'conservative', 'status', pool, address, hash],
		queryFn: () => fetchStakeStatus(address, pool, config),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
};

export const usePoolReward = (address: Address, pool: Address) => {
	const config = useConfig();
	return useQuery({
		queryKey: ['staking', 'conservative', 'status', pool, address],
		queryFn: () => fetchPoolReward(address, pool, config),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
};
