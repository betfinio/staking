import { PUBLIC_ETHSCAN } from '@/src/globals';
import { valueToNumber } from '@betfinio/abi';
import { truncateEthAddress } from '@betfinio/abi';
import { BetValue, DataTable } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import type { Claim } from 'betfinio_app/lib/types';
import { DateTime } from 'luxon';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<Claim>();

const Claims: FC<{ data: Claim[]; isLoading: boolean }> = ({ data, isLoading }) => {
	const { t } = useTranslation('staking', { keyPrefix: 'table.claims' });
	const columns = [
		columnHelper.accessor('timestamp', {
			header: t('date'),
			cell: (props) => <span className={'text-tertiary-foreground'}>{DateTime.fromMillis(props.getValue() * 1000).toFormat('DD, T')}</span>,
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
				<a target={'_blank'} href={`${PUBLIC_ETHSCAN}/tx/${props.getValue()}`} rel="noreferrer">
					{truncateEthAddress(props.getValue())}
				</a>
			),
		}),
	] as ColumnDef<Claim>[];

	return <DataTable columns={columns} data={data} isLoading={isLoading} />;
};

export default Claims;
