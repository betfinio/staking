import { useStakeStatus } from '@/src/lib/query/dynamic';
import type { CellContext } from '@tanstack/react-table';
import type { Stake } from 'betfinio_app/lib/types';
import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Address } from 'viem';

export const StatusCell = (props: CellContext<Stake, boolean | undefined>) => {
	const { t } = useTranslation('staking');
	const pool = props.row.getValue('pool') as Address;

	const { data, isLoading } = useStakeStatus(pool);
	if (isLoading) return <Loader className={'h-5 w-5 animate-spin'} />;

	return <span>{!data ? t('table.active') : t('table.end')}</span>;
};
