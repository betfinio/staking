import { useStakes } from '@/src/lib/query/conservative';
import { ZeroAddress } from '@betfinio/abi';
import { useAccount } from 'wagmi';
import Stakes from '../../shared/tables/Stakes/Stakes';

const StakesTable = () => {
	const { address = ZeroAddress } = useAccount();
	const { data = [], isLoading, isFetching,isRefetching } = useStakes(address);
	return <Stakes data={data} isLoading={isLoading } />;
};
export default StakesTable;
