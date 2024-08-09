import Stakes from '@/src/components/shared/tables/Stakes.tsx';
import { useStakes } from '@/src/lib/query/conservative';
import { ZeroAddress } from '@betfinio/abi';
import { useAccount } from 'wagmi';

const StakesTable = () => {
	const { address = ZeroAddress } = useAccount();
	const { data = [], isLoading, isFetching } = useStakes(address);

	return <Stakes data={data} isLoading={isLoading || isFetching} />;
};
export default StakesTable;
