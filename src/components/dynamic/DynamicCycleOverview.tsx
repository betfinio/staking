import SharedGameBlock from '@/src/components/shared/SharedGameBlock.tsx';
import { useTotalStakedDiff, useUnrealizedProfit } from '@/src/lib/query/dynamic';
import { valueToNumber } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';
import { useTotalStaked } from 'betfinio_app/lib/query/dynamic';
import { motion } from 'framer-motion';
import { CircleHelp } from 'lucide-react';
import { DateTime } from 'luxon';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const starts = [1715601600];
const secondsInWeek = 60 * 60 * 24 * 7;

for (let i = 0; i <= 80; i++) {
	starts.push(starts[starts.length - 1] + secondsInWeek * 4);
}

export const CycleOverview: FC = () => {
	const { t, i18n } = useTranslation('staking');
	const currentLocale = i18n.language;
	const { data: newStaked = [0n, 0n], isFetching: isNewStakedFetching } = useTotalStakedDiff();
	const { data: staked = 0n } = useTotalStaked();
	const { data: profit = 0n, isFetching: isProfitFetching } = useUnrealizedProfit();
	const percentage = (valueToNumber(profit) / valueToNumber(staked)) * 100;

	const cycleStart = (starts.findLast((e) => e * 1000 < Date.now()) || 0) * 1000;
	const cycleEnd = cycleStart + secondsInWeek * 1000 * 4;
	const cycleId = Math.floor(cycleStart / (secondsInWeek * 1000) / 4);

	return (
		<TooltipProvider delayDuration={0}>
			<div className={'col-span-2 md:col-span-1 p-3 md:p-5 relative  bg-card border border-border rounded-lg flex justify-between flex-col gap-4'}>
				<Tooltip>
					<TooltipTrigger className={'absolute  top-3 right-3'}>
						<CircleHelp className={'w-5 h-5 text-secondary-foreground cursor-pointer'} />
					</TooltipTrigger>
					<TooltipContent
						className={'staking bg-card px-4 py-2 rounded-md border border-border text-foreground  [&_b]:font-semibold [&_b]:text-secondary-foreground'}
					>
						<div className={'text-sm w-[350px] '} dangerouslySetInnerHTML={{ __html: t('dynamic.cycleOverview.toolTip') }} />
					</TooltipContent>
				</Tooltip>
				<h1 className={'text-left font-normal text-sm lg:text-base md:font-semibold flex flex-row gap-1'}>
					{t('dynamic.cycleOverview.dynamicCycle')} <div className={'underline cursor-pointer'}>#{cycleId}</div> {t('dynamic.cycleOverview.overview')}
				</h1>
				<div>
					<div className={'flex justify-between text-tertiary-foreground text-xs font-semibold'}>
						<span>{t('dynamic.cycleOverview.cycleStart')}</span>
						<span>{t('dynamic.cycleOverview.cycleEnd')}</span>
					</div>
					<div className={'my-[4px]'}>
						<CycleProgress start={cycleStart} end={cycleEnd} />
					</div>
					<div className={'flex justify-between text-tertiary-foreground  text-xs'}>
						<span>
							{DateTime.fromMillis(cycleStart).toFormat('DD', {
								locale: currentLocale === 'cz' ? 'cs' : currentLocale,
							})}
						</span>
						<span>
							{DateTime.fromMillis(cycleEnd).toFormat('DD', {
								locale: currentLocale === 'cz' ? 'cs' : currentLocale,
							})}
						</span>
					</div>
				</div>
				<div className={'md:hidden'}>
					<SharedGameBlock
						games={[
							{
								amount: newStaked[0],
								label: t('dynamic.newStakes.newStakes'),
								isLoading: isNewStakedFetching,
								className: 'border border-secondary-foreground',
								subtitle: `+${newStaked[1]} ${t('stakers')}`,
							},
							{
								amount: profit,
								label: t('conservative.gameProfit.cycleRevenue'),
								isLoading: isProfitFetching,
								className: 'border border-success',
								subtitle: `(${profit >= 0 ? '+' : '-'}${percentage.toFixed(2)}%)`,
							},
							{
								amount: 0n,
								label: t('conservative.endingStakers.endingStakes'),
								isLoading: false,
								className: 'border border-red-roulette',
								subtitle: `0 ${t('stakers')}`,
							},
						]}
					/>
				</div>
				<div className={'md:grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-4 hidden'}>
					<NewStakes />
					<GamesProfit />
					<EndingStakes />
				</div>
			</div>
		</TooltipProvider>
	);
};

export const CycleProgress: FC<{ start: number; end: number }> = ({ start, end }) => {
	const endTime = DateTime.fromMillis(end);
	const now = DateTime.fromMillis(Date.now());
	const { days, hours, minutes } = endTime.diff(now, ['days', 'hours', 'minutes', 'seconds']);
	const progress = (Math.round(Date.now() - start) / (end - start)) * 100;
	return (
		<div>
			<div className={'h-[20px] w-full bg-background'}>
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${progress}%` }}
					transition={{ duration: 0.5, ease: 'easeInOut' }}
					className={'bg-success  rounded-[4px] h-full relative'}
				>
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
						className={cn(
							'absolute top-1/2 -translate-y-1/2 text-[10px] font-bold whitespace-nowrap',
							progress > 50 ? 'right-0 pr-2 text-background' : 'right-0 translate-x-[100%] pl-2',
						)}
					>
						{days >= 1 ? `${days}D ${hours}H ${minutes}M` : `${hours}H ${minutes}M`}
					</motion.p>
				</motion.div>
			</div>
		</div>
	);
};

const NewStakes: FC = () => {
	const { data: newStaked = [0n, 0n] } = useTotalStakedDiff();
	const { t } = useTranslation('staking', { keyPrefix: 'dynamic' });

	return (
		<Tooltip>
			<TooltipTrigger>
				<div className={'shrink-0 border border-secondary-foreground py-4 px-3 rounded-md bg-background text-sm text-tertiary-foreground'}>
					<div className={'font-semibold text-center leading-[10px]'}>{t('newStakes.newStakes')}</div>
					<div className={'mt-5'}>
						<div className={'flex justify-center text-secondary-foreground'}>
							+<BetValue value={valueToNumber(newStaked[0])} withIcon={true} />
						</div>
						<div className={'text-center '}>
							({Number(newStaked[1])} {t('newStakes.stakers')})
						</div>
					</div>
				</div>
			</TooltipTrigger>
			<TooltipContent className={'bg-card text-foreground p-2 text-sm border-border border rounded-md'}>
				{t('newStakes.volumeStakedDuringCurrentCycle')}
			</TooltipContent>
		</Tooltip>
	);
};

const GamesProfit = () => {
	const { t } = useTranslation('staking', { keyPrefix: 'conservative' });

	const { data: staked = 0n } = useTotalStaked();
	const { data: profit = 0n } = useUnrealizedProfit();
	const percentage = (valueToNumber(profit) / valueToNumber(staked)) * 100;

	return (
		<Tooltip>
			<TooltipTrigger>
				<div className={'border border-success py-4 px-3 rounded-md bg-background text-sm text-tertiary-foreground'}>
					<p className={'font-semibold text-center leading-[10px]'}>{t('gameProfit.cycleRevenue')}</p>
					<div className={'mt-5'}>
						<div className={'flex justify-center font-bold text-success'}>
							{profit >= 0 ? '+' : ''}
							<BetValue value={valueToNumber(profit)} withIcon={true} />
						</div>
						<p className={'text-center '}>
							({profit >= 0 ? '+' : '-'}
							{percentage.toFixed(2)}%)
						</p>
					</div>
				</div>
			</TooltipTrigger>
			<TooltipContent className={'bg-card text-foreground p-2 text-sm border-border border rounded-md'}>
				{t('gameProfit.volumeToDistributeBetweenStakers')}
			</TooltipContent>
		</Tooltip>
	);
};

const EndingStakes = () => {
	const { t } = useTranslation('staking');
	// todo
	return (
		<div className={'border border-destructive py-4 px-3 rounded-md bg-background text-sm text-tertiary-foreground'}>
			<div className={'font-semibold text-center leading-[10px]'}>{t('conservative.endingStakers.endingStakes')}</div>
			<div className={'mt-5'}>
				<div className={'flex justify-center text-red-roulette'}>
					<BetValue value={0} withIcon={true} />
				</div>
				<div className={'text-center '}>0 {t('conservative.endingStakers.stakers')}</div>
			</div>
		</div>
	);
};
