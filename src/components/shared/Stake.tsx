import Lock from "@betfinio/ui/dist/icons/Lock";
import {FC, useState} from "react";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {valueToNumber} from "@betfinio/hooks/dist/utils";
import {useAccount, useConfig} from "wagmi";
import {NumericFormat} from "react-number-format";
import {useTranslation} from "react-i18next";
import {ZeroAddress} from "@betfinio/abi";
import {useAllowance, useBalance, useIncreaseAllowance} from "betfinio_app/lib/query/token";
import {useStake as useStakeD} from "@/src/lib/query/dynamic";
import {useStake as useStakeC} from "@/src/lib/query/conservative";
import {StakingType} from "@/src/lib/types.ts";

const Stake: FC<{ type: StakingType }> = ({type}) => {
	const {t} = useTranslation('', {keyPrefix: 'staking'})
	const [value, setValue] = useState('')
	const temp = Number(value.split(',').join(''));
	const {address = ZeroAddress} = useAccount();
	const {data: allowance = 0n} = useAllowance(address)
	const {mutate: increase} = useIncreaseAllowance()
	const {data: balance = 0n} = useBalance(address);
	const {mutate: stakeD, isPending: loadingD, data: dataD} = useStakeD()
	const {mutate: stakeC, isPending: loadingC, data: dataC} = useStakeC()
	
	const config = useConfig();
	const handleStake = async () => {
		const amount = BigInt(temp) * 10n ** 18n;
		if (balance >= amount && allowance >= amount) {
			if (type === 'dynamic') {
				stakeD({amount, config})
			} else {
				stakeC({amount, config})
			}
		}
	}
	
	const allowanceValue = valueToNumber(allowance)
	const maxAllowed = Math.min(valueToNumber(balance), valueToNumber(allowance))
	return <div className={'flex w-full  p-3 md:p-8 md:py-6 bg-unstake-background bg-no-repeat bg-cover rounded-lg flex-col justify-between items relative'}>
		<h2 className={'text-xl font-semibold opacity-90'}>{t('conservative.stakeBet')}</h2>
		<span className={'text-sm my-1 text-gray-500'}>{t('conservative.stakingPeriod')}</span>
		<div className={'w-full flex flex-row justify-between gap-3 relative'}>
			<div className={'w-full px-4 font-semibold border border-gray-800 rounded-lg md:rounded-xl text-sm sm:text-base text-[#6A6F84] bg-primary flex items-center gap-2'}>
				<Lock className={' w-5 h-5 md:w-6 md:h-6'}/>
				<NumericFormat placeholder={t('conservative.placeholder', {count: allowanceValue})} min={0} value={value}
				               onChange={e => setValue(e.target.value)}
				               className={"bg-transparent w-full outline-0 py-2 h-[52px] grow"}
				               allowNegative={false}
				               max={maxAllowed}
				               decimalScale={0}
				               thousandSeparator=","/>
				<span className={'text-xs cursor-pointer text-yellow-400'} onClick={() => {
					setValue(Math.floor(maxAllowed).toFixed(0))
				}}>
					MAX
				</span>
			</div>
			<button onClick={handleStake} disabled={temp < 10000 || BigInt(temp) * 10n ** 18n > balance}
			        className={'rounded-lg px-6 p-2 md:py-4 min-w-[90px] flex flex-row justify-center items-center text-sm md:text-base h-[52px] font-semibold bg-green-500  disabled:bg-gray-700 disabled:cursor-not-allowed'}>
				{loadingD || loadingC ? <ArrowPathIcon className={'h-4 w-4 animate-spin'}/> : t('conservative.stake')}
			</button>
		</div>
	</div>
};


export default Stake;