import { useStakes } from '@/src/lib/query/dynamic';
import { ZeroAddress } from '@betfinio/abi';
import { useAccount } from 'wagmi';
import Stakes from '../../shared/tables/Stakes/Stakes';

const StakesTable = () => {
	const { address = ZeroAddress } = useAccount();
	const { data = [], isLoading, isFetching } = useStakes(address);

	return <Stakes data={data} isLoading={isLoading || isFetching} />;
};
export default StakesTable;
