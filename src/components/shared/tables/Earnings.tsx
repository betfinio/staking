import { PUBLIC_ETHSCAN } from '@/src/globals';
import type { Earning } from '@/src/lib/types';
import { valueToNumber } from '@betfinio/abi';
import { truncateEthAddress } from '@betfinio/abi';
import { BetValue, DataTable } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { DateTime } from 'luxon';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<Earning>();

const Earnings: FC<{ data: Earning[]; isLoading: boolean }> = ({ data, isLoading }) => {
	const { t } = useTranslation('staking', { keyPrefix: 'table.earnings' });
	const columns = [
		columnHelper.accessor('timestamp', {
			header: t('date'),
			cell: (props) => <span className={'text-tertiary-foreground text-xs md:text-sm'}>{DateTime.fromMillis(props.getValue() * 1000).toFormat('DD, T')}</span>,
		}),
		columnHelper.accessor('amount', {
			header: t('amount'),
			cell: (props) => (
				<div className={'font-semibold text-secondary-foreground text-xs md:text-sm flex flex-row items-center gap-1 '}>
					<BetValue value={valueToNumber(props.getValue())} precision={2} withIcon={true} />
				</div>
			),
		}),
		columnHelper.accessor('transaction', {
			header: t('transaction'),
			cell: (props) => (
				<a className={' text-xs md:text-sm'} href={`${PUBLIC_ETHSCAN}/tx/${props.getValue()}`}>
					{truncateEthAddress(props.getValue())}
				</a>
			),
		}),
		columnHelper.accessor('pool', {
			header: t('pool'),
			meta: {
				className: 'hidden md:table-cell',
			},
			cell: (props) => (
				<a className={' text-xs md:text-sm'} href={`${PUBLIC_ETHSCAN}/address/${props.getValue()}`}>
					{truncateEthAddress(props.getValue())}
				</a>
			),
		}),
	] as ColumnDef<Earning>[];

	return <DataTable columns={columns} data={data} isLoading={isLoading} />;
};

export default Earnings;
