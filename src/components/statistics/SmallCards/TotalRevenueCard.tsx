import { useRevenueStatisticsCurrent, useStakedStatisticsCurrent } from '@/src/lib/query/statistics';
import cx from 'clsx';
import { useTranslation } from 'react-i18next';
import { InfoCard } from './InfoCard';
export const TotalRevenueCard = () => {
	const { data, isLoading } = useRevenueStatisticsCurrent();
	const { t } = useTranslation('staking', { keyPrefix: 'statistics' });

	return (
		<div
			className={cx({
				blur: isLoading,
			})}
		>
			<InfoCard titleType="currency" title={data?.sum ?? 0} header={t('totalEarned')} tooltipContent={[t('totalEarnedTooltip')]} />
		</div>
	);
};
