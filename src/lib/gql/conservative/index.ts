import { GetStakedDocument, type GetStakedQuery, execute } from '@/.graphclient';
import type { ExecutionResult } from 'graphql/execution';
import type { Address } from 'viem';

export const requestConservativeStakes = async (staker: Address) => {
	const data: ExecutionResult<GetStakedQuery> = await execute(GetStakedDocument, { staker, staking: import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS });
	return data.data?.stakeds.map((stake) => {
		return {
			amount: BigInt(stake.amount),
			start: Number(stake.blockTimestamp),
			pool: stake.pool as Address,
			reward: BigInt(stake.reward),
			staker: stake.staker as Address,
			hash: stake.transactionHash as Address,
			end: Number(stake.unlock),
			ended: false,
		};
	});
};
