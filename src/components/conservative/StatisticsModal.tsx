import SharedGameBlock from '@/src/components/shared/SharedGameBlock.tsx';
import { useLuroContribution, usePredictContribution, useTotalProfit } from '@/src/lib/query/conservative';
import { valueToNumber } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { Bank, CloseModal } from '@betfinio/components/icons';
import { BetValue } from '@betfinio/components/shared';
import { DialogClose, Separator } from '@betfinio/components/ui';

import { ShieldCheckIcon } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const CONSERVATIVE_STAKING_ADDRESS = import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS;

const StatisticsModal: FC = () => {
	const { t } = useTranslation('staking');
	const { data: totalProfit } = useTotalProfit();
	const { data: predictContribution = 0n } = usePredictContribution();
	const { data: luroContribution = 0n } = useLuroContribution();
	return (
		<div className={cn(' rounded-lg bg-card z-10  font-semibold text-foreground w-fit mx-auto')}>
			<div className={'py-5 px-7'}>
				<div className={'flex justify-between items-center'}>
					<div className={'text-sm '}>{t('conservative.statisticsModal.conservativeStaking')}</div>

					<DialogClose>
						<CloseModal className={'cursor-pointer hover:text-destructive transition-all duration-300'} />
					</DialogClose>
				</div>
				<div className={'mt-7 flex items-center justify-center gap-3'}>
					<Bank className={'text-secondary-foreground'} />
					<div className={'text-2xl flex flex-row items-center gap-2'}>
						<BetValue value={valueToNumber(totalProfit)} withIcon />
					</div>
				</div>
				<Separator className="my-6" />

				<div className={'mb-3 text-center text-sm'}>{t('conservative.statisticsModal.gamesContributionStatistics')}</div>
				<SharedGameBlock
					games={[
						{ amount: predictContribution, label: t('games.predict') },
						{ amount: luroContribution, label: t('games.luro') },
						{ amount: 0n, label: t('games.soon') },
					]}
				/>
				<Separator className="my-6" />
				<div className={'text-center text-sm mb-4'}>{t('conservative.statisticsModal.stakingContract')}</div>
				<div className={'flex items-center justify-center gap-2 '}>
					<ShieldCheckIcon className={'text-success w-4 h-4'} />
					<a
						href={`${import.meta.env.PUBLIC_ETHSCAN}/address/${CONSERVATIVE_STAKING_ADDRESS}`}
						target={'_blank'}
						className={'font-normal text-xs md:text-base underline'}
						rel="noreferrer"
					>
						{CONSERVATIVE_STAKING_ADDRESS}
					</a>
				</div>
			</div>
		</div>
	);
};

export default StatisticsModal;
