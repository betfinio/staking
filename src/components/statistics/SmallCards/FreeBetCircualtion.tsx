import cx from 'clsx';
import { useTranslation } from 'react-i18next';
import { InfoCard } from './InfoCard';

export const FreeBetCirculation: React.FC = () => {
	const { t } = useTranslation('staking', { keyPrefix: 'statistics' });

	return (
		<div>
			<InfoCard titleType="currency" title={381111111111 + 163333333333} header={t('freeBetCircle')} tooltipContent={[t('freeBetCircleTooltip')]} />
		</div>
	);
};
