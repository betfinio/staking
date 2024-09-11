import { GraphQLClient } from 'graphql-request';
import { gql } from 'graphql-tag';
import type { Address } from 'viem';
import type { StakedInfo } from '../types';
import { getSdk } from './conservative.gen';

gql`
      query getStaked($staker: Bytes) {
          stakeds(where: {staker: $staker},orderBy:blockTimestamp,orderDirection:desc) {
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

const URL = import.meta.env.PUBLIC_CONSERVATIVE_GRAPH_URL;

const client = new GraphQLClient(URL);

export const requestConservativeStakes = async (staker: Address) => {
	const getStaked = getSdk(client).getStaked;

	const data = await getStaked({ staker });
	return data.stakeds as StakedInfo[];
};
