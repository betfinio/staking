import SharedGameBlock from '@/src/components/shared/SharedGameBlock.tsx';
import { valueToNumber } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { Bank, CloseModal } from '@betfinio/components/icons';
import { BetValue } from '@betfinio/components/shared';
import { DialogClose } from '@betfinio/components/ui';

import { useTotalProfit } from 'betfinio_app/lib/query/dynamic';
import { ShieldCheckIcon } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const DYNAMIC_STAKING_ADDRESS = import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS;

const StatisticsModal: FC = () => {
	const { t } = useTranslation('staking');
	const { data: totalProfit = 0n } = useTotalProfit();
	return (
		<div className={cn('rounded-lg bg-card z-10 border border-border font-semibold text-foreground w-full mx-auto')}>
			<div className={'py-5 px-7'}>
				<div className={'flex justify-between items-center'}>
					<p className={'text-sm '}>{t('dynamic.statisticsModal.dynamicStaking')}</p>
					<div>
						<DialogClose>
							<CloseModal className={'cursor-pointer hover:text-destructive transition-all duration-300'} />
						</DialogClose>
					</div>
				</div>
				<div className={'mt-7 flex items-center justify-center gap-3'}>
					<Bank className={'text-secondary-foreground'} />
					<div className={'text-2xl flex flex-row items-center gap-2'}>
						<BetValue value={valueToNumber(totalProfit)} withIcon />
					</div>
				</div>
				<div className={'h-[2px] opacity-5 bg-foreground my-6'} />
				<p className={'mb-3 text-center text-sm'}>{t('dynamic.statisticsModal.gamesContributionStatistics')}</p>
				<SharedGameBlock
					games={[
						{ amount: 0n, label: t('games.roulette') },
						{ amount: 123n * 10n ** 18n, label: t('games.soon') },
						{ amount: 123n * 10n ** 18n, label: t('games.soon') },
					]}
				/>
				<div className={'h-[2px] opacity-5 bg-foreground my-6'} />

				<p className={'text-center text-sm mb-4'}>{t('dynamic.statisticsModal.stakingContract')}</p>
				<div className={'flex items-center justify-center gap-2 '}>
					<ShieldCheckIcon className={'text-success w-4 h-4'} />
					<a
						href={`${import.meta.env.PUBLIC_ETHSCAN}/address/${DYNAMIC_STAKING_ADDRESS}`}
						target={'_blank'}
						className={'font-normal text-xs md:text-base underline'}
						rel="noreferrer"
					>
						{DYNAMIC_STAKING_ADDRESS}
					</a>
				</div>
			</div>
		</div>
	);
};

export default StatisticsModal;
