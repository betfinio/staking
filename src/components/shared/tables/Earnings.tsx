import {Earning} from "@/src/lib/types";
import {createColumnHelper} from "@tanstack/react-table"
import {useTranslation} from "react-i18next";
import {DateTime} from "luxon";
import {truncateEthAddress} from "@betfinio/hooks/dist/utils";
import {BetValue} from "betfinio_app/BetValue";
import {valueToNumber, ZeroAddress} from "@betfinio/abi";
import {DataTable} from "betfinio_app/DataTable";
import {useAccount} from "wagmi";
import {FC} from "react";

const ETHSCAN = import.meta.env.PUBLIC_ETHSCAN

const columnHelper = createColumnHelper<Earning>()

const Earnings: FC<{ data: Earning[], isLoading: boolean }> = ({data, isLoading}) => {
	const {t} = useTranslation('', {keyPrefix: 'staking'})
	const {address = ZeroAddress} = useAccount()
	
	const columns = [
		columnHelper.accessor("timestamp", {
			header: 'Date',
			cell: (props) => <span className={'text-gray-400 text-xs md:text-base'}>
				{DateTime.fromMillis(props.getValue() * 1000).toFormat('DD, T')}
			</span>
		}),
		columnHelper.accessor("amount", {
			header: "Amount",
			cell: (props) => <div
				className={'font-semibold text-yellow-400 text-xs md:text-base flex flex-row items-center gap-1 '}>
				<BetValue value={valueToNumber(props.getValue())} precision={2} withIcon={true}/>
			</div>
		}), columnHelper.accessor("transaction", {
			header: "Transaction",
			cell: (props) => <a className={' text-xs md:text-base'} href={ETHSCAN + '/tx/' + props.getValue()}>{truncateEthAddress(props.getValue())}</a>
		}), columnHelper.accessor("pool", {
			header: "Pool",
			meta: {
				className: 'hidden md:table-cell'
			},
			cell: (props) => <a className={' text-xs md:text-base'} href={ETHSCAN + '/address/' + props.getValue()}>{truncateEthAddress(props.getValue())}</a>
		}),
	]
	
	// @ts-ignore
	return <DataTable columns={columns} data={data} isLoading={isLoading}/>
}

export default Earnings