import {useActivePools} from "@/src/lib/query/conservative";
import Pools from "@/src/components/shared/tables/Pools.tsx";

const PoolsTable = () => {
	const {data = [], isLoading, isFetching} = useActivePools();
	
	return <Pools data={data} isLoading={isLoading || isFetching}/>
}
export default PoolsTable