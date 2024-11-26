import { useTotalProfit as useTotalProfitC, useTotalStakers as useTotalStakersC } from '@/src/lib/query/conservative';
import { useTotalStakers as useTotalStakersD } from '@/src/lib/query/dynamic';

import type { StakingType } from '@/src/lib/types';
import { valueToNumber } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { useTotalStaked as useTotalStakedC } from 'betfinio_app/lib/query/conservative';
import { useTotalProfit as useTotalProfitD, useTotalStaked as useTotalStakedD } from 'betfinio_app/lib/query/dynamic';
import { UserIcon } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const Analytics: FC<{ type: StakingType }> = ({ type }) => {
	const { data: tvlC = 0n, isLoading: isTvlLoadingC } = useTotalStakedC();
	const { data: stakersC = 0, isLoading: isStakersLoadingC } = useTotalStakersC();
	const { data: profitC = 0n, isLoading: isProfitLoadingC } = useTotalProfitC();

	const { data: tvlD = 0n, isLoading: isTvlLoadingD } = useTotalStakedD();
	const { data: stakersD = 0, isLoading: isStakersLoadingD } = useTotalStakersD();
	const { data: profitD = 0n, isLoading: isProfitLoadingD } = useTotalProfitD();

	const tvl = type === 'conservative' ? tvlC : tvlD;
	const stakers = type === 'conservative' ? stakersC : stakersD;
	const profit = type === 'conservative' ? profitC : profitD;

	const { t } = useTranslation('staking');

	return (
		<div className={'flex-grow flex-row items-center gap-4 lg:gap-8 justify-end whitespace-nowrap hidden md:flex'}>
			<div className={'flex flex-col leading-none'}>
				<span className={'text-sm'}>{t('stat.tvl')}</span>
				<div className={cn('font-medium flex flex-row gap-1 items-center')}>
					<BetValue value={valueToNumber(tvl)} withIcon />
				</div>
			</div>
			<div className={'flex flex-col leading-none'}>
				<span className={'text-sm'}>{t('stat.stakers')}</span>
				<div className={cn('font-semibold flex flex-row items-center gap-0')}>
					{stakers}
					<UserIcon className={'w-[14px] h-[14px]'} />
				</div>
			</div>
			<div className={'w-[1px] bg-foreground h-[36px] hidden md:block'} />
			<div className={'flex flex-col leading-none'}>
				<span className={'text-sm'}>{t('stat.profit')}</span>
				<div className={cn('font-medium flex flex-row gap-1 items-center text-secondary-foreground')}>
					<BetValue value={valueToNumber(profit)} withIcon />
				</div>
			</div>
		</div>
	);
};

export default Analytics;
