import { useGetTradingVolume } from '@/src/lib/query/statistics';
import { cn } from 'betfinio_app/lib/utils';
import { useTranslation } from 'react-i18next';
import { InfoCard } from './InfoCard';

export const TradingVolumeCard: React.FC = () => {
	const { data, isLoading } = useGetTradingVolume();
	const { t } = useTranslation('staking', { keyPrefix: 'statistics' });

	return (
		<div
			className={cn({
				blur: isLoading,
			})}
		>
			<InfoCard titleType="currency" title={data ?? 0} header={t('tradingVolume')} tooltipContent={[t('tradingVolumeTooltip')]} />
		</div>
	);
};
