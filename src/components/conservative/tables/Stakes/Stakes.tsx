import { truncateEthAddress, valueToNumber } from '@betfinio/abi';
import { createColumnHelper } from '@tanstack/react-table';
import { BetValue } from 'betfinio_app/BetValue';
import { DataTable } from 'betfinio_app/DataTable';
import type { Stake } from 'betfinio_app/lib/types';
import { DateTime } from 'luxon';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { RewardCell } from './RewardCell';
import { StatusCell } from './StatusCell';

const columnHelper = createColumnHelper<Stake>();

const Stakes: FC<{ data: Stake[]; isLoading: boolean }> = ({ data, isLoading }) => {
	const { t } = useTranslation('', { keyPrefix: 'staking' });
	const columns = [
		columnHelper.accessor('start', {
			header: t('table.date'),
			meta: {
				className: 'hidden md:table-cell ',
			},
			cell: (props) => <span className={'text-gray-400'}>{DateTime.fromMillis(props.getValue() * 1000).toFormat('DD, T')}</span>,
		}),
		columnHelper.accessor('end', {
			header: t('table.unlockDate'),
			cell: (props) => <span className={'text-gray-400 text-xs md:text-sm'}>{DateTime.fromMillis(props.getValue() * 1000).toFormat('DD, T')}</span>,
		}),
		columnHelper.accessor('pool', {
			header: t('table.pool'),
			meta: {
				className: 'hidden md:table-cell',
			},
			cell: (props) => (
				<a target={'_blank'} href={`${import.meta.env.PUBLIC_ETHSCAN}/address/${props.getValue()}`} rel="noreferrer">
					{truncateEthAddress(props.getValue())}
				</a>
			),
		}),
		columnHelper.accessor('amount', {
			header: t('table.amount'),
			cell: (props) => (
				<div className={'flex gap-1 items-center'}>
					<BetValue
						className={'font-semibold text-yellow-400 text-xs md:text-sm flex flex-row items-center gap-1'}
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
	];

	// @ts-ignore
	return <DataTable columns={columns} data={data} isLoading={isLoading} />;
};

export default Stakes;
