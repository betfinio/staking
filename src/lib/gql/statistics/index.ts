import {
	GetStakingStatsDocument,
	type GetStakingStatsQuery,
	type GetTotalConservativeDistributionsQuery,
	type GetTotalConservativeDistributionsQueryVariables,
	type GetTotalDynamicDistributionsQuery,
	type GetTotalDynamicDistributionsQueryVariables,
	GetTotalPlayersDocument,
	type GetTotalPlayersQuery,
	GetTradingVolumeDocument,
	type GetTradingVolumeQuery,
	execute,
} from '@/.graphclient';
import logger from '@/src/config/logger';
import { valueToNumber } from '@betfinio/abi';
import type { ExecutionResult } from 'graphql/execution';
import { Address } from 'viem';
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

export const fetchTotalPlayers = async () => {
	logger.start('[statistics]', 'fetching total players');
	const data: ExecutionResult<GetTotalPlayersQuery> = await execute(GetTotalPlayersDocument, {});

	return data.data?.statistics_collection[0].totalPlayers;
};

// Define the interface for the date range
export interface DateRange {
	start: number;
	end: number;
}

type ProfitDynamicDistributionResponse = ExecutionResult<Record<`profitDistribution${number}`, GetTotalConservativeDistributionsQuery['profitDistributions']>>;
export const fetchDynamicStakingTotalDistribution = async (ranges: DateRange[]) => {
	console.log('[statistics]', 'Fetching staking total distribution series');

	// Prepare the variables
	const variables = {} as Record<string, number>;

	// Construct the query string dynamically
	let query = 'query GetTotalDynamicDistributions(';
	const rangeVariables: string[] = [];

	// Dynamically add variables and the query for each range
	ranges.forEach((_, index) => {
		const rangeIndex = index + 1; // Start from 1 for human-readable aliases
		query += `$start${rangeIndex}: BigInt!, $end${rangeIndex}: BigInt!, `;
		rangeVariables.push(`$start${rangeIndex}`, `$end${rangeIndex}`);
	});

	// Remove trailing comma
	query = query.slice(0, -2);
	query += ') {';

	// Add profitDistribution fields for each range dynamically
	ranges.forEach((_, index) => {
		const rangeIndex = index + 1;
		query += `
		profitDistribution${rangeIndex}: profitDistributions(
		  where: { blockTimestamp_gt: $start${rangeIndex}, blockTimestamp_lt: $end${rangeIndex} }
		) {
		  pool
		  amount
		  blockNumber
		}
	  `;
	});

	query += '}';

	// Dynamically create the variables
	ranges.forEach((range, index) => {
		const rangeIndex = index + 1;
		variables[`start${rangeIndex}`] = range.start;
		variables[`end${rangeIndex}`] = range.end;
	});

	//Execute the query
	const data: ProfitDynamicDistributionResponse = await execute(query, variables);

	console.log('[statistics]', 'Fetched staking total distribution series:', data);

	const formattedData = mapAndSumResponse(data.data, ranges).filter((data) => data.value > 0);

	return formattedData;
};
type ProfitConservativeDistributionResponse = ExecutionResult<
	Record<`profitDistribution${number}`, GetTotalConservativeDistributionsQuery['profitDistributions']>
>;
export const fetchConservativeStakingTotalDistribution = async (ranges: DateRange[]) => {
	console.log('[statistics]', 'Fetching staking total distribution series');

	// Prepare the variables
	const variables = {} as Record<string, number>;

	// Construct the query string dynamically
	let query = 'query GetTotalConservativeDistributions(';
	const rangeVariables: string[] = [];

	// Dynamically add variables and the query for each range
	ranges.forEach((_, index) => {
		const rangeIndex = index + 1; // Start from 1 for human-readable aliases
		query += `$start${rangeIndex}: BigInt!, $end${rangeIndex}: BigInt!, `;
		rangeVariables.push(`$start${rangeIndex}`, `$end${rangeIndex}`);
	});

	// Remove trailing comma
	query = query.slice(0, -2);
	query += ') {';

	// Add profitDistribution fields for each range dynamically
	ranges.forEach((_, index) => {
		const rangeIndex = index + 1;
		query += `
		profitDistribution${rangeIndex}: profitDistributions(
		  where: { blockTimestamp_gt: $start${rangeIndex}, blockTimestamp_lt: $end${rangeIndex} }
		) {
		  pool
		  amount
		  blockNumber
		}
	  `;
	});

	query += '}';

	// Dynamically create the variables
	ranges.forEach((range, index) => {
		const rangeIndex = index + 1;
		variables[`start${rangeIndex}`] = range.start;
		variables[`end${rangeIndex}`] = range.end;
	});

	//Execute the query
	const data: ProfitConservativeDistributionResponse = await execute(query, variables);

	console.log('[statistics]', 'Fetched staking total distribution series:', data);

	const formattedData = mapAndSumResponse(data.data, ranges);
	return formattedData.filter((data) => data.value > 0);
};

// Helper function to sum the amounts
const sumAmounts = (distribution: Array<{ amount: string }>) => {
	return distribution.reduce((total, { amount }) => total + BigInt(amount), BigInt(0));
};

// Map and summarize the profit distributions
const mapAndSumResponse = (response: ProfitConservativeDistributionResponse['data'] | ProfitDynamicDistributionResponse['data'], ranges: DateRange[]) => {
	if (!response) return [];
	return (Object.keys(response) as `profitDistribution${number}`[]).map((category, index) => {
		// Get the current distribution array
		const distribution = response[category];

		// Sum the amounts for this category
		const totalAmount = sumAmounts(distribution);

		// Map each category to the desired structure
		return {
			label: ranges[index].end, // Placeholder for the label

			value: valueToNumber(totalAmount), // Convert to a regular number for the chart
		};
	});
};

// Helper function to sum the volumes
const sumVolumes = (distribution: Array<{ volumeToken0: string }>) => {
	console.log(distribution, 'distribution');
	return distribution.reduce((total, { volumeToken0 }) => total + Number(volumeToken0), 0);
};
export const fetchTradingVolume = async () => {
	const data: ExecutionResult<GetTradingVolumeQuery> = await execute(GetTradingVolumeDocument, {
		first: 30,
		pool: '0x549bb7e94da23bc31e5fc4685548587f4f7c9b16',
	});

	if (!data?.data?.pool?.poolDayData) {
		return 0n;
	}

	const sum = sumVolumes(data.data.pool?.poolDayData);

	return sum;
};
