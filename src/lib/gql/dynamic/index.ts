import { GetStakedDocument, type GetStakedQuery, execute } from '@/.graphclient';
import logger from '@/src/config/logger';
import { PUBLIC_DYNAMIC_STAKING_ADDRESS } from '@/src/globals';
import type { Stake } from 'betfinio_app/lib/types';
import type { ExecutionResult } from 'graphql/execution';
import type { Address } from 'viem';

export const requestDynamicStakes = async (staker: Address) => {
	logger.start('[dynamic]', 'fetching stakes', staker);
	const data: ExecutionResult<GetStakedQuery> = await execute(GetStakedDocument, { staker, staking: PUBLIC_DYNAMIC_STAKING_ADDRESS });
	logger.success('[dynamic]', 'fetching stakes', data.data?.stakeds.length);
	if (data.data) {
		return data.data.stakeds.map((stake) => {
			return {
				amount: BigInt(stake.amount),
				start: Number(stake.blockTimestamp),
				pool: stake.pool as Address,
				reward: BigInt(stake.reward),
				staker: stake.staker as Address,
				hash: stake.transactionHash as Address,
				end: Number(stake.unlock),
				ended: false,
			} as Stake;
		});
	}
	return [];
};
