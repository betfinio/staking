import { GetConservativeStakedDocument, type GetConservativeStakedQuery, execute } from '@/.graphclient';
import type { ExecutionResult } from 'graphql/execution';
import type { Address } from 'viem';
export const requestConservativeStakes = async (staker: Address) => {
	const data: ExecutionResult<GetConservativeStakedQuery> = await execute(GetConservativeStakedDocument, { staker });
	return data.data?.conservativeStakeds.map((stake) => {
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
