import {useStakes} from "@/src/lib/query/conservative";
import {useAccount} from "wagmi";
import {ZeroAddress} from "@betfinio/abi";
import Stakes from "@/src/components/shared/tables/Stakes.tsx";

const StakesTable = () => {
	const {address = ZeroAddress} = useAccount();
	const {data = [], isLoading, isFetching} = useStakes(address);
	
	return <Stakes data={data} isLoading={isLoading || isFetching}/>
}
export default StakesTable