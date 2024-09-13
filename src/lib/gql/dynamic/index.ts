import { GetDynamicStakedDocument, type GetDynamicStakedQuery, execute } from '@/.graphclient';
import type { ExecutionResult } from 'graphql/execution';
import type { Address } from 'viem';
export const requestDynamicStakes = async (staker: Address) => {
	const data: ExecutionResult<GetDynamicStakedQuery> = await execute(GetDynamicStakedDocument, { staker });
	const dymanicStakeFormated = data.data?.dynamicStakeds.map((stake) => {
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
	return dymanicStakeFormated;
};
