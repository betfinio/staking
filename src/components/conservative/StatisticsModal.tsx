import {FC} from "react";
import {useTranslation} from "react-i18next";
import {usePredictContribution, useTotalProfitWithBalance} from "@/src/lib/query/conservative";
import cx from "clsx";
import {Bank, CloseModal} from "@betfinio/ui/dist/icons";
import {DialogClose} from "betfinio_app/dialog";
import {valueToNumber} from "@betfinio/abi";
import {BetValue} from "betfinio_app/BetValue";
import SharedGameBlock from "@/src/components/shared/SharedGameBlock.tsx";
import {ShieldCheckIcon} from "lucide-react";
import {Link} from "@tanstack/react-router";

const CONSERVATIVE_STAKING_ADDRESS = import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS;

const StatisticsModal: FC = () => {
	const {t} = useTranslation('staking')
	const {data: totalProfit = 0n} = useTotalProfitWithBalance()
	const {data: predictContribution} = usePredictContribution();
	return <div className={cx('rounded-lg bg-primaryLighter z-10 border border-gray-800 font-semibold text-white w-full h-[400px] max-w-[600px] mx-auto')}>
		<div className={'py-5 px-7'}>
			<div className={'flex justify-between items-center'}>
				<div className={'text-sm '}>Conservative staking</div>
				<div>
					<DialogClose>
						<CloseModal className={'cursor-pointer hover:text-[#DD375F] transition-all duration-300'}/>
					</DialogClose>
				</div>
			</div>
			<div className={'mt-7 flex items-center justify-center gap-3'}>
				<Bank className={'text-[#FFC800]'}/>
				<div className={'text-2xl flex flex-row items-center gap-2'}>
					<BetValue value={valueToNumber(totalProfit)} withIcon/>
				</div>
			</div>
			<div className={'h-[2px] opacity-5 bg-white my-6'}/>
			<div className={'mb-3 text-center text-sm'}>Games contribution statistics</div>
			<SharedGameBlock games={[
				{amount: predictContribution, label: t('games.predict')},
				{amount: 0n, label: t('games.soon')},
				{amount: 0n, label: t('games.soon')},
			]}/>
			<div className={'h-[2px] opacity-5 bg-white my-6'}/>
			<div className={'text-center text-sm mb-4'}>Staking contract</div>
			<div className={'flex items-center justify-center gap-2 '}>
				<ShieldCheckIcon className={'text-[#38BB7F] w-4 h-4'}/>
				<Link to={import.meta.env.PUBLIC_ETHSCAN + `/address/${CONSERVATIVE_STAKING_ADDRESS}`} target={'_blank'}
				      className={'font-normal text-xs md:text-base underline'}>{CONSERVATIVE_STAKING_ADDRESS}</Link>
			</div>
		</div>
	</div>
}

export default StatisticsModal;