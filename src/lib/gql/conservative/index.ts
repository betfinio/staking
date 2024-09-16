import { GetClaimsDocument, type GetClaimsQuery, GetStakedDocument, type GetStakedQuery, execute } from '@/.graphclient';
import logger from '@/src/config/logger.ts';
import type { Claim, Stake } from 'betfinio_app/lib/types';
import type { ExecutionResult } from 'graphql/execution';
import type { Address } from 'viem';

export const requestConservativeStakes = async (staker: Address): Promise<Stake[]> => {
	logger.start('[conservative]', 'fetching stakes', staker);
	const data: ExecutionResult<GetStakedQuery> = await execute(GetStakedDocument, { staker, staking: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS });
	logger.success('[conservative]', 'fetching stakes', data.data?.stakeds.length);
	if (data.data) {
		return data.data.stakeds.map((stake) => ({
			amount: BigInt(stake.amount),
			start: Number(stake.blockTimestamp),
			pool: stake.pool as Address,
			reward: BigInt(stake.reward),
			staker: stake.staker as Address,
			hash: stake.transactionHash as Address,
			end: Number(stake.unlock),
			ended: false,
		}));
	}
	return [];
};

export const requestConservativeClaims = async (staker: Address): Promise<Claim[]> => {
	logger.start('[conservative]', 'fetching claims', staker);
	const data: ExecutionResult<GetClaimsQuery> = await execute(GetClaimsDocument, { staker });
	logger.success('[conservative]', 'fetching claims', data.data?.claimeds.length);
	if (!data.data) return [];
	return data.data.claimeds.map((claim) => {
		return {
			timestamp: Number(claim.blockTimestamp),
			amount: BigInt(claim.amount),
			transaction: claim.transactionHash as Address,
		} as Claim;
	});
};
