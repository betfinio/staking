import { useQuery } from '@tanstack/react-query';
import { useConfig } from 'wagmi';
import {
	fetchCurrentDistribution,
	fetchLiquidityInPool,
	fetchRevenueStatisticsTotalCurrent,
	fetchStakedStatisticsTotalCurrent,
	fetchStakerStatisticsTotalCurrent,
	fetchTotalAffiliatePaid,
	fetchTotalMembers,
} from '../../api/statistics';
import {
	type DateRange,
	fetchConservativeStakingTotalDistribution,
	fetchDynamicStakingTotalDistribution,
	fetchStatisticsTotalStaking,
	fetchTotalPlayers,
	fetchTradingVolume,
} from '../../gql/statistics';
import type { Timeframe } from '../../types';

export const useStakingStatistics = (time: Timeframe) => {
	return useQuery({
		queryKey: ['statistics', 'total', time],
		queryFn: () => fetchStatisticsTotalStaking(time),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};
export const useStakedStatisticsCurrent = () => {
	const config = useConfig();
	return useQuery({
		queryKey: ['statistics', 'staked', 'total', 'current'],
		queryFn: () => fetchStakedStatisticsTotalCurrent(config),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};
export const useStakersStatisticsCurrent = () => {
	const config = useConfig();
	return useQuery({
		queryKey: ['statistics', 'stakers', 'total', 'current'],
		queryFn: () => fetchStakerStatisticsTotalCurrent(config),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};
export const useRevenueStatisticsCurrent = () => {
	const config = useConfig();
	return useQuery({
		queryKey: ['statistics', 'revenue', 'total', 'current'],
		queryFn: () => fetchRevenueStatisticsTotalCurrent(config),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};
export const useGetTotalMemebrs = () => {
	const config = useConfig();
	return useQuery({
		queryKey: ['statistics', 'totalMembers'],
		queryFn: () => fetchTotalMembers(config),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};
export const useGetTotalPlayers = () => {
	const config = useConfig();
	return useQuery({
		queryKey: ['statistics', 'totalPlayers'],
		queryFn: () => fetchTotalPlayers(),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};

export const useGetTotalAffiliatePaid = () => {
	const config = useConfig();
	return useQuery({
		queryKey: ['statistics', 'totalAffiliatePaid'],
		queryFn: () => fetchTotalAffiliatePaid(config),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};
export const useGetTotalDynamicDistribution = (range: DateRange[]) => {
	const config = useConfig();
	return useQuery({
		queryKey: ['statistics', 'dynamic', 'totalDistribution', range],
		queryFn: () => fetchDynamicStakingTotalDistribution(range),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};
export const useGetTotalConservativeDistribution = (range: DateRange[]) => {
	const config = useConfig();
	return useQuery({
		queryKey: ['statistics', 'conservative', 'totalDistribution', range],
		queryFn: () => fetchConservativeStakingTotalDistribution(range),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};

export const useGetLiquidtyInPool = () => {
	const config = useConfig();
	return useQuery({
		queryKey: ['statistics', 'liquidityInPool'],
		queryFn: () => fetchLiquidityInPool(config),
		initialData: { betResult: 0n, usdtResult: 0n },
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});
};

export const useGetTradingVolume = () => {
	return useQuery({
		queryKey: ['statistics', 'tradingVolume'],
		queryFn: () => fetchTradingVolume(),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};

export const useGetCurrentDistribution = () => {
	const config = useConfig();
	return useQuery({
		queryKey: ['statistics', 'currentDistribution'],
		queryFn: () => fetchCurrentDistribution(config),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};
