import { useGetTotalAffiliatePaid } from '@/src/lib/query/statistics';

import cx from 'clsx';
import { useTranslation } from 'react-i18next';
import { InfoCard } from './InfoCard';
export const TotalAffiliatePaid = () => {
	const { data, isLoading } = useGetTotalAffiliatePaid();
	const { t } = useTranslation('staking', { keyPrefix: 'statistics' });
	return (
		<div
			className={cx({
				blur: isLoading,
			})}
		>
			<InfoCard titleType="currency" title={data ?? 0} header={t('totalAffiliatePaid')} tooltipContent={[t('totalAffiliatePaidTooltip')]} />
		</div>
	);
};
