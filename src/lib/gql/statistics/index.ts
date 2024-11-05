import { GetStakingStatsDocument, type GetStakingStatsQuery, execute } from '@/.graphclient';
import logger from '@/src/config/logger';
import { valueToNumber } from '@betfinio/abi';
import type { ExecutionResult } from 'graphql/execution';
import type { Timeframe } from '../../types';
export const fetchStatisticsTotalStaking = async (timeSeriesType: Timeframe) => {
	logger.start('[statistics]', 'fetching stakes statistics');
	const data: ExecutionResult<GetStakingStatsQuery> = await execute(GetStakingStatsDocument, { timeSeriesType, first: 20 });

	const formattedData = data.data?.totalStakingStatistics_collection.reverse().map((item) => {
		return {
			conservativeTotalStaked: valueToNumber(item.conservativeTotalStaking),
			dynamicTotalStaked: valueToNumber(item.dynamicTotalStaking),
			timestamp: new Date(+item.timestamp * 1000).getTime() / 1000,
			conservativeTotalStakers: +item.conservativeTotalStakers as number,
			dynamicTotalStakers: +item.dynamicTotalStakers as number,
			dynamicTotalRevenue: valueToNumber(item.dynamicTotalRevenues),
			conservativeTotalRevenue: valueToNumber(item.conservativeTotalRevenues),
		};
	});
	logger.success('[statistics]', 'fetching stakes statistics', formattedData);

	return formattedData;
};
