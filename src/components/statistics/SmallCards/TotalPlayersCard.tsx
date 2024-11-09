import { useGetTotalPlayers } from '@/src/lib/query/statistics';
import cx from 'clsx';
import { useTranslation } from 'react-i18next';
import { InfoCard } from './InfoCard';

export const TotalPlayersCard = () => {
	const { data, isLoading } = useGetTotalPlayers();
	const { t } = useTranslation('staking', { keyPrefix: 'statistics' });
	return (
		<div
			className={cx({
				blur: isLoading,
			})}
		>
			<InfoCard titleType="user" title={data ?? 0} header={t('totalPlayers')} tooltipContent={[t('totalPlayersTooltip')]} />
		</div>
	);
};
