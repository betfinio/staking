import {useEarnings, useStakes} from "@/src/lib/query/conservative";
import {useAccount} from "wagmi";
import {ZeroAddress} from "@betfinio/abi";
import Earnings from "@/src/components/shared/tables/Earnings.tsx";

const EarningsTable = () => {
	const {address = ZeroAddress} = useAccount();
	const {data = [], isFetching, isLoading} = useEarnings(address);
	
	return <Earnings data={data} isLoading={isFetching || isLoading}/>
}
export default EarningsTable