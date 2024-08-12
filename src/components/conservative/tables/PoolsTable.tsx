import Pools from '@/src/components/shared/tables/Pools.tsx';
import { useActivePools } from '@/src/lib/query/conservative';

const PoolsTable = () => {
	const { data = [], isLoading, isFetching } = useActivePools();
	return <Pools data={data} isLoading={isLoading || isFetching} type={'conservative'} />;
};
export default PoolsTable;
