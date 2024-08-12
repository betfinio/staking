import SharedGameBlock from '@/src/components/shared/SharedGameBlock.tsx';
import { useTotalStakedDiff, useUnrealizedProfit } from '@/src/lib/query/dynamic';
import { valueToNumber } from '@betfinio/abi';
import { BetValue } from 'betfinio_app/BetValue';
import { useTotalProfit, useTotalStaked } from 'betfinio_app/lib/query/dynamic';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'betfinio_app/tooltip';
import cx from 'clsx';
import { motion } from 'framer-motion';
import { CircleHelp } from 'lucide-react';
import { DateTime } from 'luxon';
import type { FC } from 'react';

const starts = [1715601600];
const secondsInWeek = 60 * 60 * 24 * 7;

for (let i = 0; i <= 80; i++) {
	starts.push(starts[starts.length - 1] + secondsInWeek * 4);
}

export const CycleOverview: FC = () => {
	const { data: newStaked = [0n, 0n], isFetching: isNewStakedFetching } = useTotalStakedDiff();
	const { data: staked = 0n } = useTotalStaked();
	const { data: profit = 0n, isFetching: isProfitFetching } = useUnrealizedProfit();
	console.log(profit);
	const percentage = (valueToNumber(profit) / valueToNumber(staked)) * 100;

	const cycleStart = (starts.findLast((e) => e * 1000 < Date.now()) || 0) * 1000;
	const cycleEnd = cycleStart + secondsInWeek * 1000 * 4;
	const cycleId = Math.floor(cycleStart / (secondsInWeek * 1000) / 4);
	const handleCalculate = async () => {
		console.log(123);
	};

	const handleCalculateOld = async () => {
		console.log(123, 'old');
	};
	return (
		<TooltipProvider delayDuration={0}>
			<div className={'col-span-2 md:col-span-1 p-3 md:p-5 relative  bg-primaryLighter border border-gray-800 rounded-lg flex justify-between flex-col gap-4'}>
				<Tooltip>
					<TooltipTrigger className={'absolute  top-3 right-3'}>
						<CircleHelp className={'w-5 h-5 text-yellow-400 cursor-pointer'} onClick={handleCalculateOld} />
					</TooltipTrigger>
					<TooltipContent className={'bg-black px-4 py-2 rounded-md border border-yellow-400 text-white w-[350px]'}>
						<div className={'text-sm'}>
							<b className={'font-semibold text-yellow-400'}>Dynamic staking cycle</b> is a period of <b className={'font-semibold text-yellow-400'}>4 weeks</b>{' '}
							when players bet against stakers in <b className={'font-semibold text-yellow-400'}>dynamic games</b> and generate{' '}
							<b className={'font-semibold text-yellow-400'}>Profit and Loss</b> (PnL) to dynamic staking.
							<br />
							<br />
							Every <b className={'font-semibold text-yellow-400'}>4th Monday at 12.00 UTC</b> there is a calculation window when the PnL is distributed among
							all the <b className={'font-semibold text-yellow-400'}>dynamic pools.</b>
							<br />
							<br />
							Staking rewards distribution is done automatically without claim, staking in drawdowns (when users won more than lost in a cycle) does not receive
							payout till the drawdown is covered.
						</div>
					</TooltipContent>
				</Tooltip>
				<h1 className={'text-left font-normal text-sm lg:text-base md:font-semibold'}>
					Dynamic cycle{' '}
					<div className={'underline cursor-pointer'} onClick={handleCalculate}>
						#{cycleId}
					</div>{' '}
					overview
				</h1>
				<div>
					<div className={'flex justify-between text-[#6A6F84] text-xs font-semibold'}>
						<span>Cycle start</span>
						<span>Cycle end</span>
					</div>
					<div className={'my-[4px]'}>
						<CycleProgress start={cycleStart} end={cycleEnd} />
					</div>
					<div className={'flex justify-between text-[#6A6F84] text-xs'}>
						<span>{DateTime.fromMillis(cycleStart).toFormat('DD')}</span>
						<span>{DateTime.fromMillis(cycleEnd).toFormat('DD')}</span>
					</div>
				</div>
				<div className={'md:hidden'}>
					<SharedGameBlock
						games={[
							{
								amount: newStaked[0],
								label: 'New stakes',
								isLoading: isNewStakedFetching,
								className: 'border border-yellow-400',
								subtitle: `+${newStaked[1]} stakers`,
							},
							{
								amount: profit,
								label: 'Cycle revenue',
								isLoading: isProfitFetching,
								className: 'border border-green-400',
								subtitle: `(${profit >= 0 ? '+' : '-'}${percentage.toFixed(2)}%)`,
							},
							{
								amount: 0n,
								label: 'Ending stakes',
								isLoading: false,
								className: 'border border-red-roulette',
								subtitle: '0 stakers',
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
			<div className={'h-[20px] w-full bg-primary'}>
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${progress}%` }}
					transition={{ duration: 0.5, ease: 'easeInOut' }}
					className={'bg-green-500  rounded-[4px] h-full relative'}
				>
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
						className={cx(
							'absolute top-1/2 -translate-y-1/2 text-[10px] font-bold whitespace-nowrap',
							progress > 50 ? 'right-0 pr-2 text-primary' : 'right-0 translate-x-[100%] pl-2',
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
	return (
		<Tooltip>
			<TooltipTrigger>
				<div className={'shrink-0 border border-[#FFC800] py-4 px-3 rounded-md bg-primary text-sm text-[#6A6F84]'}>
					<div className={'font-semibold text-center leading-[10px]'}>New stakes</div>
					<div className={'mt-5'}>
						<div className={'flex justify-center text-[#FFC800]'}>
							+<BetValue value={valueToNumber(newStaked[0])} withIcon={true} />
						</div>
						<div className={'text-center '}>({Number(newStaked[1])} stakers)</div>
					</div>
				</div>
			</TooltipTrigger>
			<TooltipContent className={'bg-black text-white p-2 text-sm border-yellow-400 border rounded-md'}>Volume staked during current cycle</TooltipContent>
		</Tooltip>
	);
};

const GamesProfit = () => {
	const { data: staked = 0n } = useTotalStaked();
	const { data: profit = 0n } = useUnrealizedProfit();
	const percentage = (valueToNumber(profit) / valueToNumber(staked)) * 100;

	return (
		<Tooltip>
			<TooltipTrigger>
				<div className={'border border-green-500 py-4 px-3 rounded-md bg-primary text-sm text-[#6A6F84]'}>
					<p className={'font-semibold text-center leading-[10px]'}>Cycle revenues</p>
					<div className={'mt-5'}>
						<div className={'flex justify-center font-bold text-green-500'}>
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
			<TooltipContent className={'bg-black text-white p-2 text-sm border-yellow-400 border rounded-md'}>Volume to distribute between stakers</TooltipContent>
		</Tooltip>
	);
};

const EndingStakes = () => {
	// todo
	return (
		<div className={'border border-red-roulette py-4 px-3 rounded-md bg-primary text-sm text-[#6A6F84]'}>
			<div className={'font-semibold text-center leading-[10px]'}>Ending stakes</div>
			<div className={'mt-5'}>
				<div className={'flex justify-center text-red-roulette'}>
					<BetValue value={0} withIcon={true} />
				</div>
				<div className={'text-center '}>0 stakers</div>
			</div>
		</div>
	);
};
