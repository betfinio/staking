import { useQuery } from '@tanstack/react-query';
import { useConfig } from 'wagmi';
import {
	fetchRevenueStatisticsTotalCurrent,
	fetchStakedStatisticsTotalCurrent,
	fetchStakerStatisticsTotalCurrent,
	fetchTotalMembers,
} from '../../api/statistics';
import { fetchStatisticsTotalStaking } from '../../gql/statistics';
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
