import { PUBLIC_CONSERVATIVE_STAKING_ADDRESS } from '@/src/globals';
import { useStaked, useTotalBets, useTotalVolume } from '@/src/lib/query/conservative';
import { ZeroAddress } from '@betfinio/abi';
import { valueToNumber } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { Bet, Blackjack, CoinLarge, ConservativeStaking } from '@betfinio/components/icons';
import { BetValue } from '@betfinio/components/shared';
import { useTotalStaked } from 'betfinio_app/lib/query/conservative';
import { useBalance } from 'betfinio_app/lib/query/token';
import { animate } from 'framer-motion';
import { CalculatorIcon, Coins } from 'lucide-react';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

const Counter: FC<{ from: number; to: number }> = ({ from, to }) => {
	const nodeRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const node = nodeRef.current;

		const controls = animate(from, to, {
			duration: 1,
			onUpdate(value) {
				if (node) {
					node.textContent = Math.floor(value).toLocaleString();
				}
			},
		});

		return () => controls.stop();
	}, [from, to]);

	return <div ref={nodeRef} />;
};

const StakingInfo: FC = () => {
	const { t } = useTranslation('staking');
	const { address = ZeroAddress } = useAccount();
	const { data: totalVolume = 0n } = useTotalVolume();
	const { data: totalBets = 0 } = useTotalBets();
	const { data: currentBalance = 0n, isFetching: isTotalProfitFetching, isLoading: isTotalProfitLoading } = useBalance(PUBLIC_CONSERVATIVE_STAKING_ADDRESS);
	const { data: totalStaked = 0n } = useTotalStaked();
	const { data: playerStaked = 0n } = useStaked(address);
	const share = valueToNumber(playerStaked) / valueToNumber(totalStaked || 1n);
	const [from, setFrom] = useState(0);
	const to = useMemo(() => {
		const value = Math.floor(valueToNumber(isTotalProfitLoading ? 0n : currentBalance) * (Number.isNaN(share) ? 0 : share));
		setTimeout(() => {
			setFrom(value);
		}, 1000);
		return value;
	}, [isTotalProfitLoading, currentBalance, share]);

	const [glow, setGlow] = useState(false);

	useEffect(() => {
		setGlow(true);
		setTimeout(() => {
			setGlow(false);
		}, 1000);
	}, [currentBalance]);
	const cycleId = Math.floor((Date.now() - 1000 * 60 * 60 * 36) / 1000 / 60 / 60 / 24 / 7);

	return (
		<div className={'cursor-pointer bg-card border border-border rounded-lg'}>
			<div className={'font-semibold text-center text-sm lg:text-base whitespace-nowrap lg:text-left p-4 hidden md:flex flex-row items-center justify-between'}>
				{t('conservative.stats.conservativeGamesStats')}
				<div className={''}>{t('conservative.stats.yourRevenues')}:</div>
			</div>
			<div className={'rounded-lg flex justify-between font-semibold p-3'}>
				<div className={'flex items-center justify-center flex-row gap-3 h-full text-sm lg:text-base'}>
					<CoinLarge className={'hidden md:block text-secondary-foreground w-20 h-20'} />
					<div className={'flex flex-col gap-[18px] md:gap-4 lg:text-sm xl:text-base justify-between items-start h-full'}>
						<div className={cn(' flex flex-row items-center gap-2')}>
							<CalculatorIcon className={'w-6 h-6 md:w-5 md:h-5 text-secondary-foreground'} /> {t('conservative.stats.twoGames')}
						</div>
						<div className={cn('flex ml-1 flex-row items-center gap-2 font-semibold')}>
							<Blackjack className={'w-6 h-6 md:w-4 md:h-4 text-secondary-foreground'} />
							{t('total.bets', { count: totalBets })}
						</div>
						<div className={cn('flex flex-row items-center gap-2')}>
							<Coins className={'w-6 h-6 md:w-5 md:h-5 text-secondary-foreground'} />
							<BetValue value={valueToNumber(totalVolume)} precision={2} withIcon /> {t('conservative.stats.volume')}
						</div>
					</div>
				</div>
				<div className={'text-center flex flex-col justify-center '}>
					<ConservativeStaking
						className={cn('mx-auto w-12 text-secondary-foreground duration-300 ', {
							'!animate-pulse text-success ': isTotalProfitFetching || glow,
						})}
					/>
					<div className={cn('mt-3 flex flex-row items-center gap-1 text-sm xl:text-base mx-auto', { 'text-success': isTotalProfitFetching || glow })}>
						<Counter from={from} to={to} />
						<Bet className={'w-4 h-4 text-accent-secondary-foreground'} />
					</div>
					<div className={'text-tertiary-foreground text-xs'}>
						{t('conservative.stats.inCycle')} #{cycleId}
					</div>
				</div>
			</div>
		</div>
	);
};
export default StakingInfo;
