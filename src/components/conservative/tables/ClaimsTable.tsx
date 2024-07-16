import {useClaims} from "@/src/lib/query/conservative";
import {useAccount} from "wagmi";
import {ZeroAddress} from "@betfinio/abi";
import Claims from "@/src/components/shared/tables/Claims.tsx";

const ClaimsTable = () => {
	const {address = ZeroAddress} = useAccount();
	const {data = [], isLoading, isFetching} = useClaims(address);
	
	return <Claims data={data} isLoading={isLoading || isFetching}/>
}
export default ClaimsTable