import { useStakeStatus } from '@/src/lib/query/conservative';
import { ZeroAddress } from '@betfinio/abi';
import type { CellContext } from '@tanstack/react-table';
import type { Stake } from 'betfinio_app/lib/types';
import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';

export const StatusCell = (props: CellContext<Stake, boolean | undefined>) => {
	const { t } = useTranslation('staking');
	const pool = props.row.getValue('pool') as Address;
	const hash = props.row.original.hash as Address;

	const { address = ZeroAddress } = useAccount();
	const { data, isLoading } = useStakeStatus(address, pool, hash);
	if (isLoading) return <Loader className={'h-5 w-5 animate-spin'} />;

	return <span>{!data ? t('table.active') : t('table.end')}</span>;
};
