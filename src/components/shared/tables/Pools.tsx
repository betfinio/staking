import { useDistributeProfit as useDistributeProfitConservative } from '@/src/lib/query/conservative';
import { useDistributeProfit as useDistributeProfitDynamic } from '@/src/lib/query/dynamic';
import type { ExtendedPoolInfo, StakingType } from '@/src/lib/types';
import { valueToNumber } from '@betfinio/abi';
import { truncateEthAddress } from '@betfinio/abi';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { PUBLIC_ETHSCAN } from '@/src/globals';
import { BetValue, DataTable } from '@betfinio/components/shared';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@betfinio/components/ui';
import { MoreHorizontal } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { Address } from 'viem';

const columnHelper = createColumnHelper<ExtendedPoolInfo>();

const Pools: FC<{
	data: ExtendedPoolInfo[];
	isLoading: boolean;
	type: StakingType;
}> = ({ data, isLoading, type }) => {
	const { t } = useTranslation('staking');

	const { mutate: distributeConservative } = useDistributeProfitConservative();
	const { mutate: distributeDynamic } = useDistributeProfitDynamic();
	const handleCalculate = (pool: Address) => {
		if (type === 'conservative') {
			distributeConservative(pool);
		} else {
			distributeDynamic(pool);
		}
	};
	const columns = [
		columnHelper.accessor('address', {
			header: t('table.pool'),
			meta: {
				className: 'lg:w-[160px]',
			},
			cell: (props) => (
				<a target={'_blank'} href={`${PUBLIC_ETHSCAN}/address/${props.getValue()}`} className={'text-tertiary-foreground'} rel="noreferrer">
					{truncateEthAddress(props.getValue())}
				</a>
			),
		}),
		columnHelper.accessor('count', {
			header: t('table.capacity'),
			cell: (props) => (
				<div className={'flex flex-col flex-grow'}>
					<span className={'text-tertiary-foreground text-sm'}>({props.getValue()}/100)</span>
					<div className={'relative rounded-full bg-card w-full mt-2 md:mt-3  overflow-hidden h-[5px]'}>
						<div className={'bg-success absolute top-0 left-0 h-[5px]'} style={{ width: `${props.getValue()}%` }} />
					</div>
				</div>
			),
		}),
		columnHelper.accessor('totalStaked', {
			header: t('table.totalStaked'),
			meta: {
				className: 'lg:w-[160px]',
			},
			cell: (props) => (
				<div className={'flex flex-row items-center'}>
					<BetValue value={valueToNumber(props.getValue())} withIcon />
				</div>
			),
		}),
		columnHelper.display({
			id: 'action',
			meta: {
				className: 'w-10',
			},
			cell: ({ row }) => {
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">{t('pools.openMenu')}</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => handleCalculate(row.original.address)}>{t('pools.distributeProfit')}</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		}),
	] as ColumnDef<ExtendedPoolInfo>[];

	return <DataTable columns={columns} data={data} isLoading={isLoading} />;
};

export default Pools;
