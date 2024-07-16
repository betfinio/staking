import {ExtendedPoolInfo} from "@/src/lib/types";
import {createColumnHelper} from "@tanstack/react-table"
import {useTranslation} from "react-i18next";
import {truncateEthAddress} from "@betfinio/hooks/dist/utils";
import {BetValue} from "betfinio_app/BetValue";
import {valueToNumber} from "@betfinio/abi";
import {DataTable} from "betfinio_app/DataTable";
import {FC} from "react";

const columnHelper = createColumnHelper<ExtendedPoolInfo>()

const Pools: FC<{ data: ExtendedPoolInfo[], isLoading: boolean }> = ({data, isLoading}) => {
	const {t} = useTranslation('', {keyPrefix: 'staking'})
	const columns = [
		columnHelper.accessor("address", {
			header: t('table.pool'),
			meta: {
				className: 'w-[160px]'
			},
			cell: (props) => <span className={'text-gray-500'}>{truncateEthAddress(props.getValue())}</span>
		}),
		columnHelper.accessor("count", {
			header: t('table.capacity'),
			cell: (props) => <div className={'flex flex-col flex-grow'}>
				<span className={'text-gray-500 text-sm'}>({props.getValue()}/100)</span>
				<div className={'relative rounded-full bg-secondaryLight w-full mt-2 md:mt-3  overflow-hidden h-[5px]'}>
					<div className={'bg-green-600 absolute top-0 left-0 h-[5px]'} style={{width: (props.getValue()) + '%'}}></div>
				</div>
			</div>
		}), columnHelper.accessor("totalStaked", {
			header: t('table.totalStaked'),
			meta: {
				className: 'w-[160px]'
			},
			cell: (props) => <div className={'flex flex-row items-center'}>
				<BetValue value={valueToNumber(props.getValue())} withIcon/>
			</div>
		}),
	]
	
	// @ts-ignore
	return <DataTable columns={columns} data={data} isLoading={isLoading}/>
}

export default Pools