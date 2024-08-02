import Pools from '@/src/components/shared/tables/Pools.tsx';
import { useActivePools } from '@/src/lib/query/dynamic';

const PoolsTable = () => {
  const { data = [], isLoading, isFetching } = useActivePools();
  console.log(data)

  return <Pools data={data} isLoading={isLoading || isFetching} i18nIsDynamicList  type={'dynamic'}/>;
};
export default PoolsTable;
