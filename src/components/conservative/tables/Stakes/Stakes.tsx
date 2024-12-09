import { PUBLIC_ETHSCAN } from '@/src/globals';
import { truncateEthAddress, valueToNumber } from '@betfinio/abi';
import { BetValue, DataTable } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import type { Stake } from 'betfinio_app/lib/types';
import { DateTime } from 'luxon';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { RewardCell } from './RewardCell';
import { StatusCell } from './StatusCell';

const columnHelper = createColumnHelper<Stake>();

const Stakes: FC<{ data: Stake[]; isLoading: boolean }> = ({ data, isLoading }) => {
	const { t } = useTranslation('staking');
	const columns = [
		columnHelper.accessor('start', {
			header: t('table.date'),
			meta: {
				className: 'hidden md:table-cell ',
			},
			cell: (props) => <span className={'text-tertiary-foreground'}>{DateTime.fromMillis(props.getValue() * 1000).toFormat('DD, T')}</span>,
		}),
		columnHelper.accessor('end', {
			header: t('table.unlockDate'),
			cell: (props) => <span className={'text-tertiary-foreground text-xs md:text-sm'}>{DateTime.fromMillis(props.getValue() * 1000).toFormat('DD, T')}</span>,
		}),
		columnHelper.accessor('pool', {
			header: t('table.pool'),
			meta: {
				className: 'hidden md:table-cell',
			},
			cell: (props) => (
				<a target={'_blank'} href={`${PUBLIC_ETHSCAN}/address/${props.getValue()}`} rel="noreferrer">
					{truncateEthAddress(props.getValue())}
				</a>
			),
		}),
		columnHelper.accessor('amount', {
			header: t('table.amount'),
			cell: (props) => (
				<div className={'flex gap-1 items-center'}>
					<BetValue
						className={'font-semibold text-secondary-foreground text-xs md:text-sm flex flex-row items-center gap-1'}
						withIcon
						precision={2}
						value={valueToNumber(props.getValue())}
					/>
				</div>
			),
		}),
		columnHelper.accessor('ended', {
			header: t('table.status'),
			meta: {
				className: 'hidden md:table-cell ',
			},
			cell: StatusCell,
		}),
		columnHelper.accessor('reward', {
			header: t('table.reward'),
			cell: RewardCell,
		}),
	] as ColumnDef<Stake, unknown>[];

	return <DataTable columns={columns} data={data} isLoading={isLoading} />;
};

export default Stakes;
