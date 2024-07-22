import Claims from '@/src/components/shared/tables/Claims.tsx';
import { useClaims } from '@/src/lib/query/conservative';
import { ZeroAddress } from '@betfinio/abi';
import { useAccount } from 'wagmi';

const ClaimsTable = () => {
  const { address = ZeroAddress } = useAccount();
  const { data = [], isLoading, isFetching } = useClaims(address);

  return <Claims data={data} isLoading={isLoading || isFetching} />;
};
export default ClaimsTable;
