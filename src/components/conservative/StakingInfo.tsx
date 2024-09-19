import { useStaked, useTotalBets, useTotalVolume } from '@/src/lib/query/conservative';
import { ZeroAddress } from '@betfinio/abi';
import { valueToNumber } from '@betfinio/abi';
import { Bet, Blackjack, CoinLarge, Coins } from '@betfinio/ui/dist/icons';
import ConservativeStaking from '@betfinio/ui/dist/icons/ConservativeStaking';
import { BetValue } from 'betfinio_app/BetValue';
import { useTotalStaked } from 'betfinio_app/lib/query/conservative';
import { useBalance } from 'betfinio_app/lib/query/token';
import cx from 'clsx';
import { animate } from 'framer-motion';
import { CalculatorIcon } from 'lucide-react';
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
	const { t } = useTranslation('', { keyPrefix: 'staking' });
	const { address = ZeroAddress } = useAccount();
	const { data: totalVolume = 0n } = useTotalVolume();
	const { data: totalBets = 0 } = useTotalBets();
	const {
		data: currentBalance = 0n,
		isFetching: isTotalProfitFetching,
		isLoading: isTotalProfitLoading,
	} = useBalance(import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS);
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
		<div className={'cursor-pointer bg-primaryLighter border border-gray-800 rounded-lg'}>
			<div className={'font-semibold text-center text-sm lg:text-base whitespace-nowrap lg:text-left p-4 hidden md:flex flex-row items-center justify-between'}>
				{t('conservative.stats.conservativeGamesStats')}
				<div className={''}>{t('conservative.stats.yourRevenues')}:</div>
			</div>
			<div className={'rounded-lg flex justify-between font-semibold p-3'}>
				<div className={'flex items-center justify-center flex-row gap-3 h-full text-sm lg:text-base'}>
					<CoinLarge className={'hidden md:block text-yellow-400 w-20 h-20'} />
					<div className={'flex flex-col gap-[18px] md:gap-4 lg:text-sm xl:text-base justify-between items-start h-full'}>
						<div className={cx(' flex flex-row items-center gap-2')}>
							<CalculatorIcon className={'w-6 h-6 md:w-5 md:h-5 text-yellow-400'} /> {t('conservative.stats.twoGames')}
						</div>
						<div className={cx('flex ml-1 flex-row items-center gap-2 font-semibold')}>
							<Blackjack className={'w-6 h-6 md:w-4 md:h-4 text-yellow-400'} />
							{t('total.bets', { count: totalBets })}
						</div>
						<div className={cx('flex flex-row items-center gap-2')}>
							<Coins className={'w-6 h-6 md:w-5 md:h-5 text-yellow-400'} />
							<BetValue value={valueToNumber(totalVolume)} precision={2} withIcon /> {t('conservative.stats.volume')}
						</div>
					</div>
				</div>
				<div className={'text-center flex flex-col justify-center '}>
					<ConservativeStaking
						className={cx('mx-auto w-12 text-yellow-400 duration-300 ', {
							'!animate-pulse text-green-400 ': isTotalProfitFetching || glow,
						})}
					/>
					<div className={cx('mt-3 flex flex-row items-center gap-1 text-sm xl:text-base mx-auto', { 'text-green-400': isTotalProfitFetching || glow })}>
						<Counter from={from} to={to} />
						<Bet className={'w-4 h-4'} />
					</div>
					<div className={'text-gray-500 text-xs'}>
						{t('conservative.stats.inCycle')} #{cycleId}
					</div>
				</div>
			</div>
		</div>
	);
};
export default StakingInfo;
