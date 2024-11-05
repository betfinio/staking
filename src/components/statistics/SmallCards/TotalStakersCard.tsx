import { useStakersStatisticsCurrent } from '@/src/lib/query/statistics';
import { InfoCard } from './InfoCard';

import cx from 'clsx';
import { useTranslation } from 'react-i18next';
export const TotalStakersCard = () => {
	const { data, isLoading } = useStakersStatisticsCurrent();
	const { t } = useTranslation('staking', { keyPrefix: 'statistics' });

	return (
		<div
			className={cx({
				blur: isLoading,
			})}
		>
			<InfoCard titleType="user" title={data?.sum ?? 0} header={t('totalStakers')} tooltipContent={[t('totalStakersTooltip')]} />
		</div>
	);
};
