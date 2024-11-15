import { ConservativeStakingContract, DynamicStakingContract, PassContract, TokenContract, valueToNumber } from '@betfinio/abi';
import { multicall, readContract } from '@wagmi/core';
import type { Address } from 'viem';
import type { Config } from 'wagmi';

export const fetchStakedStatisticsTotalCurrent = async (config: Config) => {
	const result = await multicall(config, {
		contracts: [
			{
				abi: DynamicStakingContract.abi,
				address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS as Address,
				functionName: 'totalStaked',
			},
			{
				abi: ConservativeStakingContract.abi,
				address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
				functionName: 'totalStaked',
			},
		],
	});

	if (!result) {
		return {
			conservativeTotalStaking: 0,
			dynamicTotalStaking: 0,
			timestamp: 0,
			sum: 0,
		};
	}

	const data = result.reduce(
		(acc, item, index) => {
			if (index === 1) {
				acc.conservativeTotalStaking = valueToNumber(item.result as bigint);
				acc.sum = (acc.sum ?? 0) + acc.conservativeTotalStaking;
			}
			if (index === 0) {
				acc.dynamicTotalStaking = valueToNumber(item.result as bigint);
				acc.sum = (acc.sum ?? 0) + acc.dynamicTotalStaking;
			}
			acc.timestamp = new Date().getTime() / 1000;

			return acc;
		},
		{} as { conservativeTotalStaking: number; dynamicTotalStaking: number; timestamp: number; sum: number },
	);

	return data;
};
export const fetchStakerStatisticsTotalCurrent = async (config: Config) => {
	const result = await multicall(config, {
		contracts: [
			{
				abi: DynamicStakingContract.abi,
				address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS as Address,
				functionName: 'totalStakers',
			},
			{
				abi: ConservativeStakingContract.abi,
				address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
				functionName: 'totalStakers',
			},
		],
	});

	if (!result) {
		return {
			conservativeTotalStaking: 0,
			dynamicTotalStaking: 0,
			timestamp: 0,
			sum: 0,
		};
	}

	const data = result.reduce(
		(acc, item, index) => {
			if (index === 1) {
				acc.conservativeTotalStakers = Number(item.result);
				acc.sum = (acc.sum ?? 0) + acc.conservativeTotalStakers;
			}
			if (index === 0) {
				acc.dynamicTotalStakers = Number(item.result);
				acc.sum = (acc.sum ?? 0) + acc.dynamicTotalStakers;
			}
			acc.timestamp = Math.floor(new Date().getTime() / 1000);

			return acc;
		},
		{} as { conservativeTotalStakers: number; dynamicTotalStakers: number; timestamp: number; sum: number },
	);

	return data;
};
export const fetchRevenueStatisticsTotalCurrent = async (config: Config) => {
	const result = await multicall(config, {
		contracts: [
			{
				abi: DynamicStakingContract.abi,
				address: import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS as Address,
				functionName: 'totalProfit',
			},
			{
				abi: ConservativeStakingContract.abi,
				address: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS as Address,
				functionName: 'totalProfit',
			},
		],
	});

	if (!result) {
		return;
	}

	const data = result.reduce(
		(acc, item, index) => {
			if (index === 1) {
				acc.conservativeTotalrevenue = valueToNumber(item.result as bigint);
				acc.sum = (acc.sum ?? 0) + acc.conservativeTotalrevenue;
			}
			if (index === 0) {
				acc.dynamicTotalRevenue = valueToNumber(item.result as bigint);
				acc.sum = (acc.sum ?? 0) + acc.dynamicTotalRevenue;
			}
			acc.timestamp = Math.floor(new Date().getTime() / 1000);

			return acc;
		},
		{} as { conservativeTotalrevenue: number; dynamicTotalRevenue: number; timestamp: number; sum: number },
	);

	return data;
};
export const fetchTotalMembers = async (config: Config) => {
	const result = await readContract(config, {
		abi: PassContract.abi,
		address: import.meta.env.PUBLIC_PASS_ADDRESS as Address,
		functionName: 'getMembersCount',
	});

	if (!result) {
		return;
	}
	return Number(result);
};
export const fetchTotalAffiliatePaid = async (config: Config) => {
	const result = (await readContract(config, {
		abi: TokenContract.abi,
		address: import.meta.env.PUBLIC_TOKEN_ADDRESS as Address,
		functionName: 'balanceOf',
		args: [import.meta.env.PUBLIC_AFFILIATE_FUND_ADDRESS as Address],
	})) as bigint;

	if (!result) {
		return;
	}
	return 381111111111n * 10n ** 18n - result;
};

export const fetchLiquidityInPool = async (config: Config) => {
	const betResult = (await readContract(config, {
		abi: TokenContract.abi,
		address: import.meta.env.PUBLIC_TOKEN_ADDRESS as Address,
		functionName: 'balanceOf',
		args: [import.meta.env.PUBLIC_LIQUIDITY_POOL_ADDRESS as Address],
	})) as bigint;
	const usdtResult = (await readContract(config, {
		abi: TokenContract.abi,
		address: import.meta.env.PUBLIC_USDT_TOKEN_ADDRESS as Address,
		functionName: 'balanceOf',
		args: [import.meta.env.PUBLIC_LIQUIDITY_POOL_ADDRESS as Address],
	})) as bigint;
	console.log(usdtResult, 'usdtResult');
	if (!betResult || !betResult) {
		return { betResult: 0n, usdtResult: 0n };
	}

	return { betResult, usdtResult };
};

export const fetchCurrentDistribution = async (config: Config): Promise<number[]> => {
	const promises = [
		readContract(config, {
			abi: TokenContract.abi,
			address: import.meta.env.PUBLIC_TOKEN_ADDRESS as Address,
			functionName: 'balanceOf',
			args: [import.meta.env.PUBLIC_BONUS_POOL_ADDRESS as Address],
		}) as Promise<bigint>,
		readContract(config, {
			abi: TokenContract.abi,
			address: import.meta.env.PUBLIC_TOKEN_ADDRESS as Address,
			functionName: 'balanceOf',
			args: [import.meta.env.PUBLIC_PARTNERS_POOL_ADDRESS as Address],
		}) as Promise<bigint>,
		readContract(config, {
			abi: TokenContract.abi,
			address: import.meta.env.PUBLIC_TOKEN_ADDRESS as Address,
			functionName: 'balanceOf',
			args: [import.meta.env.PUBLIC_TEAM_POOL_ADDRESS as Address],
		}) as Promise<bigint>,
		readContract(config, {
			abi: TokenContract.abi,
			address: import.meta.env.PUBLIC_TOKEN_ADDRESS as Address,
			functionName: 'balanceOf',
			args: [import.meta.env.PUBLIC_AFFILIATE_FUND_ADDRESS as Address],
		}) as Promise<bigint>,
	];

	const [bonusPool, partnersPool, teamPool, affiliatePool] = await Promise.all(promises);

	const stakedData = await fetchStakedStatisticsTotalCurrent(config);
	const liquidityData = await fetchLiquidityInPool(config);

	const staked = stakedData.sum || 0;
	const lockedLiquidity = liquidityData.betResult || 0n;

	const formattedData = [bonusPool, BigInt(staked) * 10n ** 18n, lockedLiquidity, teamPool, affiliatePool, partnersPool];
	const formattedDataSum = formattedData.reduce((acc, item) => acc + item, 0n);

	const freeBetTokens = 777777777777n * 10n ** 18n - formattedDataSum;
	formattedData.splice(1, 0, freeBetTokens);

	return formattedData.map((value) => valueToNumber(value));
};
