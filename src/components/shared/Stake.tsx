import { useStake as useStakeC } from '@/src/lib/query/conservative';
import { useStake as useStakeD } from '@/src/lib/query/dynamic';
import type { StakingType } from '@/src/lib/types.ts';
import { ZeroAddress } from '@betfinio/abi';
import { valueToNumber } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { toast, useToast } from '@betfinio/components/hooks';
import { Button } from '@betfinio/components/ui';
import { useAllowanceModal } from 'betfinio_app/allowance';
import { useAllowance, useBalance } from 'betfinio_app/lib/query/token';
import { Loader, Lock } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useAccount, useConfig } from 'wagmi';

const Stake: FC<{ type: StakingType }> = ({ type }) => {
	const { t } = useTranslation('staking');
	const [value, setValue] = useState('');

	const { toast: toastT } = useToast();
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
		const lowerThanLimit = temp < 10000;

		if (lowerThanLimit) {
			toast({
				title: t('toast.minimumStake'),
				variant: 'destructive',
			});
			return;
		}

		const isMoreThanBalance = BigInt(temp) * 10n ** 18n > balance;
		if (isMoreThanBalance) {
			toast({
				title: t('toast.insufficientBalanceToStake'),
				variant: 'destructive',
			});
			return;
		}

		const amount = BigInt(temp) * 10n ** 18n;
		if (balance >= amount && allowance >= amount) {
			if (type === 'dynamic') {
				stakeD({ amount, config });
			} else {
				stakeC({ amount, config });
			}
		} else if (allowance < amount) {
			toast({
				title: t('toast.insufficientAllowance'),
				variant: 'destructive',
			});
			requestAllowance?.('stake', amount);
		} else {
			toast({
				description: t('toast.insufficientBalanceToStake'),
				variant: 'destructive',
			});
		}
	};

	const allowanceValue = valueToNumber(allowance);
	const maxAllowed = Math.min(valueToNumber(balance), valueToNumber(allowance));

	return (
		<div className={'flex w-full  p-3 md:p-8 md:py-6 bg-unstake-background bg-no-repeat bg-cover rounded-lg flex-col justify-between items relative'}>
			<h2 className={'text-xl font-semibold opacity-90'}>{t('conservative.stakeBet')}</h2>
			<span className={'text-sm my-1 text-tertiary-foreground'}>{t('conservative.stakingPeriod')}</span>
			<div className={'w-full items-center flex flex-row justify-between gap-3 relative'}>
				<div
					className={
						'w-full  h-full px-4 font-semibold border border-border rounded-lg md:rounded-xl text-sm sm:text-base text-tertiary-foreground bg-background flex items-center gap-2'
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
						className={'bg-transparent w-full outline-0 py-2 h-full grow'}
						allowNegative={false}
						max={maxAllowed}
						decimalScale={0}
						thousandSeparator=","
					/>
					<div
						className={'text-xs cursor-pointer text-secondary-foreground'}
						onClick={() => {
							setValue(Math.floor(valueToNumber(balance)).toFixed(0));
						}}
					>
						MAX
					</div>
				</div>
				<Button
					onClick={handleStake}
					disabled={temp === 0 || loadingD || loadingC}
					variant={'success'}
					className="px-4 py-3   flex text-base relative"
					size="freeSize"
				>
					<span
						className={cn({
							invisible: loadingD || loadingC,
						})}
					>
						{t('conservative.stake')}
					</span>
					{(loadingD || loadingC) && <Loader className={'h-4 w-4 animate-spin absolute inset-0 m-auto'} />}
				</Button>
			</div>
		</div>
	);
};

export default Stake;
