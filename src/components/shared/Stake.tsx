import { useStake as useStakeC } from '@/src/lib/query/conservative';
import { useStake as useStakeD } from '@/src/lib/query/dynamic';
import type { StakingType } from '@/src/lib/types.ts';
import { ZeroAddress } from '@betfinio/abi';
import { valueToNumber } from '@betfinio/abi';
import Lock from '@betfinio/ui/dist/icons/Lock';
import { useAllowanceModal } from 'betfinio_app/allowance';
import { useAllowance, useBalance } from 'betfinio_app/lib/query/token';
import { toast } from 'betfinio_app/use-toast';
import { Loader } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useAccount, useConfig } from 'wagmi';

const Stake: FC<{ type: StakingType }> = ({ type }) => {
	const { t } = useTranslation('', { keyPrefix: 'staking' });
	const [value, setValue] = useState('');
	const temp = Number(value.split(',').join(''));
	const { address = ZeroAddress } = useAccount();
	const { data: allowance = 0n } = useAllowance(address);
	const { data: balance = 0n } = useBalance(address);
	const { mutate: stakeD, isPending: loadingD, data: dataD, isSuccess: successD } = useStakeD();
	const { mutate: stakeC, isPending: loadingC, data: dataC, isSuccess: successC } = useStakeC();
	const { requestAllowance, setResult, requested } = useAllowanceModal();

	useEffect(() => {
		if (dataD && successD) {
			setResult?.(dataD);
		}
	}, [dataD, successD]);
	useEffect(() => {
		if (dataC && successC) {
			setResult?.(dataC);
		}
	}, [dataC, successC]);
	useEffect(() => {
		if (requested) {
			handleStake();
		}
	}, [requested]);
	const config = useConfig();
	const handleStake = async () => {
		const amount = BigInt(temp) * 10n ** 18n;
		if (balance >= amount && allowance >= amount) {
			if (type === 'dynamic') {
				stakeD({ amount, config });
			} else {
				stakeC({ amount, config });
			}
		} else if (allowance < amount) {
			toast({
				title: 'Insufficient allowance',
				variant: 'destructive',
			});
			requestAllowance?.('stake', amount);
		} else {
			toast({
				description: 'Insufficient balance to stake',
				type: 'destructive',
			});
		}
	};

	const allowanceValue = valueToNumber(allowance);
	const maxAllowed = Math.min(valueToNumber(balance), valueToNumber(allowance));
	return (
		<div className={'flex w-full  p-3 md:p-8 md:py-6 bg-unstake-background bg-no-repeat bg-cover rounded-lg flex-col justify-between items relative'}>
			<h2 className={'text-xl font-semibold opacity-90'}>{t('conservative.stakeBet')}</h2>
			<span className={'text-sm my-1 text-gray-500'}>{t('conservative.stakingPeriod')}</span>
			<div className={'w-full flex flex-row justify-between gap-3 relative'}>
				<div
					className={
						'w-full px-4 font-semibold border border-gray-800 rounded-lg md:rounded-xl text-sm sm:text-base text-[#6A6F84] bg-primary flex items-center gap-2'
					}
				>
					<Lock className={' w-5 h-5 md:w-6 md:h-6'} />
					<NumericFormat
						placeholder={t('conservative.placeholder', {
							count: allowanceValue,
						})}
						min={0}
						value={value}
						onChange={(e) => setValue(e.target.value)}
						className={'bg-transparent w-full outline-0 py-2 h-[52px] grow'}
						allowNegative={false}
						max={maxAllowed}
						decimalScale={0}
						thousandSeparator=","
					/>
					<div
						className={'text-xs cursor-pointer text-yellow-400'}
						onClick={() => {
							setValue(Math.floor(maxAllowed).toFixed(0));
						}}
					>
						MAX
					</div>
				</div>
				<button
					type={'button'}
					onClick={handleStake}
					disabled={temp < 10000 || BigInt(temp) * 10n ** 18n > balance}
					className={
						'rounded-lg px-6 p-2 md:py-4 min-w-[90px] flex flex-row justify-center items-center text-sm md:text-base h-[52px] font-semibold bg-green-500  disabled:bg-gray-800 disabled:cursor-not-allowed'
					}
				>
					{loadingD || loadingC ? <Loader className={'h-4 w-4 animate-spin'} /> : t('conservative.stake')}
				</button>
			</div>
			{/*{open && (*/}
			{/*	<ActionModal*/}
			{/*		open={open}*/}
			{/*		onClose={() => setOpen(false)}*/}
			{/*		onAction={handleAction}*/}
			{/*		requiredAllowance={BigInt(temp) * 10n ** 18n}*/}
			{/*		allowance={allowance}*/}
			{/*		tx={dataD || dataC}*/}
			{/*		scan={import.meta.env.PUBLIC_ETHSCAN}*/}
			{/*	/>*/}
			{/*)}*/}
		</div>
	);
};

export default Stake;
