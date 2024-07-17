import {FC, useEffect, useState} from "react";
import {truncateEthAddress, valueToNumber} from "@betfinio/hooks/dist/utils";
import CoinLarge from "@betfinio/ui/dist/icons/CoinLarge";
import {Bank, Bet, Blackjack, CloseModal, Coins} from "@betfinio/ui/dist/icons";
import cx from "clsx";
import {CalculatorIcon, ShieldCheckIcon} from "@heroicons/react/24/outline";
import {useAccount} from "wagmi";
import ConservativeStaking from "@betfinio/ui/dist/icons/ConservativeStaking";
import {motion} from "framer-motion";
import {Link} from "@tanstack/react-router";
import {useTranslation} from "react-i18next";
import {ZeroAddress} from "@betfinio/abi";
import {useStaked, useTotalBets, useTotalProfit, useTotalStaked, useTotalVolume} from "@/src/lib/query/dynamic";
import {Dialog, DialogClose, DialogContent, DialogTrigger} from "betfinio_app/dialog";
import SharedGameBlock from "@/src/components/shared/SharedGameBlock.tsx";
import {BetValue} from "betfinio_app/BetValue";

const DYNAMIC_STAKING_ADDRESS = import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS;

const StakingInfo: FC = () => {
	const {t} = useTranslation('', {keyPrefix: 'staking'})
	const {address = ZeroAddress} = useAccount()
	
	const {data: totalProfit = 0n, isLoading: isTotalProfitLoading, isFetching: isTotalProfitFetching} = useTotalProfit()
	const {data: totalBets = 0, isLoading: isTotalBetsLoading} = useTotalBets()
	const {data: totalVolume = 0n, isLoading: isTotalVolumeLoading} = useTotalVolume()
	const {data: tvl = 0n} = useTotalStaked();
	
	const {data: totalStaked = 0n} = useTotalStaked();
	const {data: playerStaked = 0n} = useStaked(address)
	const share = valueToNumber(playerStaked) / valueToNumber(totalStaked || 1n);
	const cycleId = Math.floor((Date.now() - 1000 * 60 * 60 * 36) / 1000 / 60 / 60 / 24 / 7);
	
	const [glow, setGlow] = useState(false)
	
	useEffect(() => {
		setGlow(true)
		setTimeout(() => {
			setGlow(false)
		}, 1000)
	}, [totalProfit]);
	return <Dialog>
		<DialogTrigger asChild>
			<div className={'bg-primaryLighter border border-gray-800 rounded-lg cursor-pointer'}>
				<div
					className={'font-semibold text-center text-sm lg:text-base whitespace-nowrap lg:text-left p-4 hidden md:flex flex-row items-center justify-between'}>
					Dynamic games stats
					<div className={''}>Your revenues:</div>
				</div>
				<div className={'rounded-lg flex justify-between font-semibold p-3'}>
					<div className={'flex items-center justify-center flex-row gap-3 h-full text-sm lg:text-base'}>
						<CoinLarge className={'hidden md:block text-yellow-400'}/>
						<div className={'flex flex-col gap-[18px] md:gap-4 justify-between items-start h-full'}>
							<p className={cx('flex flex-row items-center gap-2')}>
								<CalculatorIcon className={'w-6 h-6 md:w-5 md:h-5 text-yellow-400'}/> 1 game
							</p>
							<p
								className={cx('flex ml-1 flex-row items-center gap-2 font-semibold', {'animate-pulse blur-sm': isTotalBetsLoading})}>
								<Blackjack className={'w-6 h-6 md:w-4 md:h-4 text-yellow-400'}/>
								{t('total.bets', {count: isTotalBetsLoading ? 12345 : totalBets})}
							</p>
							<div className={cx('flex flex-row items-center gap-2')}>
								<Coins className={'w-6 h-6 md:w-5 md:h-5 text-yellow-400'}/>
								<BetValue value={valueToNumber(isTotalVolumeLoading ? 123456n * 10n ** 18n : totalVolume)}
								          precision={2} withIcon/> volume
							</div>
						</div>
					</div>
					<div className={'text-center flex flex-col justify-center '}>
						<ConservativeStaking className={cx('mx-auto w-12 text-[#FFC800] duration-300 ', {"!animate-pulse text-green-400 ": isTotalProfitFetching || glow})}/>
						<div
							className={cx('mt-3 flex flex-row items-center gap-1  mx-auto', {'animate-pulse blur-sm': isTotalProfitLoading}, {"text-green-400": isTotalProfitFetching || glow})}>
							{Math.floor(valueToNumber(isTotalProfitLoading ? 1234567n * 10n ** 18n : totalProfit) * share).toLocaleString()}
							<Bet className={'w-4 h-4'}/>
						</div>
						<div className={'text-gray-500 text-xs'}>In cycle #{cycleId}</div>
					</div>
				</div>
			</div>
		</DialogTrigger>
		<DialogContent>
			<motion.div className={cx('rounded-lg bg-primaryLighter z-10 border border-gray-800 font-semibold text-white mx-auto max-w-[500px]')}>
				<div className={'py-5 px-7'}>
					<div className={'flex justify-between items-center'}>
						<p className={'text-sm '}>Dynamic staking</p>
						<DialogClose>
							<CloseModal className={'cursor-pointer hover:text-[#DD375F] transition-all duration-300'}/>
						</DialogClose>
					</div>
					<div className={'mt-7 flex items-center justify-center gap-3'}>
						<Bank className={'text-[#FFC800]'}/>
						<div className={'text-2xl flex flex-row items-center gap-2'}>{valueToNumber(tvl).toLocaleString()} <Bet className={'w-5 h-5'}/></div>
					</div>
					<div className={'h-[2px] opacity-5 bg-white my-6'}/>
					<p className={'mb-3 text-center text-sm'}>Detailed statistics</p>
					<SharedGameBlock games={[
						{amount: 0n, label: t('games.roulette')},
						{amount: 123n * 10n ** 18n, label: t('games.soon')},
						{amount: 123n * 10n ** 18n, label: t('games.soon')},
					]}/>
					<div className={'h-[2px] opacity-5 bg-white my-6'}/>
					
					<p className={'text-center text-sm mb-4'}>Staking contract</p>
					<p className={'flex items-center justify-center gap-2 '}>
						<ShieldCheckIcon className={'text-[#38BB7F] w-4 h-4'}/>
						<span className={'font-normal sm:hidden'}>{truncateEthAddress(DYNAMIC_STAKING_ADDRESS)}</span>
						<Link to={import.meta.env.PUBLIC_ETHSCAN + `/address/${DYNAMIC_STAKING_ADDRESS}`} target={'_blank'}
						      className={'font-normal hidden sm:inline underline'}>{DYNAMIC_STAKING_ADDRESS}</Link>
					</p>
				</div>
			</motion.div>
		</DialogContent>
	</Dialog>
}
export default StakingInfo;