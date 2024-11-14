import { useGetLiquidtyInPool } from '@/src/lib/query/statistics';
import cx from 'clsx';
import { useTranslation } from 'react-i18next';
import { InfoCard } from './InfoCard';

export const LiquidityInPoolCard: React.FC = () => {
	const { data, isLoading } = useGetLiquidtyInPool();
	const { t } = useTranslation('staking', { keyPrefix: 'statistics' });
	console.log('liquidiyt', data);

	const title2 = data.usdtResult;
	return (
		<div
			className={cx({
				blur: isLoading,
			})}
		>
			<InfoCard titleType="currencyPair" title={data.betResult} title2={title2} header={t('liquidityInPool')} tooltipContent={[t('liquidityInPoolTooltip')]} />
		</div>
	);
};
