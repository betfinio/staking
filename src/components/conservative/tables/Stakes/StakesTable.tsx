import { useStakes } from '@/src/lib/query/conservative';
import { ZeroAddress } from '@betfinio/abi';
import { useAccount } from 'wagmi';
import Stakes from './Stakes';

const StakesTable = () => {
	const { address = ZeroAddress } = useAccount();
	const { data = [], isLoading } = useStakes(address);
	return <Stakes data={data} isLoading={isLoading} />;
};
export default StakesTable;
