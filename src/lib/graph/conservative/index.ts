import { Client, cacheExchange, fetchExchange, gql } from 'urql';
import type { Address } from 'viem';
import type { StakedInfo } from '../../types';
const URL = import.meta.env.PUBLIC_CONSERVATIVE_GRAPH_URL;

const client = new Client({
	url: URL,
	exchanges: [fetchExchange],
});

export const requestConservativeStakes = async (staker: Address) => {
	const query = gql`
      query($staker: String) {
          stakeds(where: {staker: $staker}) {
            transactionHash
            blockTimestamp
            unlock
            pool
            amount 
            staker
            reward             
             
          }
      }
	`;

	const result = await client.query(query, { staker });

	return result.data.stakeds.reverse() as StakedInfo[];
};
