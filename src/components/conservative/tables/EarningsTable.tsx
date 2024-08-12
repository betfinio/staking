import Earnings from '@/src/components/shared/tables/Earnings.tsx';
import { useEarnings, useStakes } from '@/src/lib/query/conservative';
import { ZeroAddress } from '@betfinio/abi';
import { useAccount } from 'wagmi';

const EarningsTable = () => {
	const { address = ZeroAddress } = useAccount();
	const { data = [], isFetching, isLoading } = useEarnings(address);

	return <Earnings data={data} isLoading={isFetching || isLoading} />;
};
export default EarningsTable;
