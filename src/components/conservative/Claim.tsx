import {
	useClaim,
	useClaimable,
	useStaked,
} from '@/src/lib/query/conservative';
import {ZeroAddress} from '@betfinio/abi';
import {valueToNumber} from '@betfinio/hooks/dist/utils';
import {BetValue} from 'betfinio_app/BetValue';
import {useTotalStaked} from 'betfinio_app/lib/query/conservative';
import {useBalance} from 'betfinio_app/lib/query/token';
import cx from 'clsx';
import type {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {useAccount} from 'wagmi';
import {Loader} from "lucide-react";

interface ClaimProps {
	className: string;
}

const Claim: FC<ClaimProps> = ({className}) => {
	const {t} = useTranslation('', {keyPrefix: 'staking'});
	const {address = ZeroAddress} = useAccount();
	const {data: staked = 0n, isLoading: isStakedLoading} = useStaked(address);
	const {data: claimable = 0n, isLoading: isClaimableLoading} =
		useClaimable(address);
	const {data: balance = 0n} = useBalance(
		import.meta.env.PUBLIC_CONSERVATIVE_STAKING_ADDRESS,
	);
	const {mutate, isPending: loading} = useClaim();
	const {data: totalStaked = 0n} = useTotalStaked();
	const share =
		(valueToNumber(staked) / (valueToNumber(totalStaked) || 1)) * 100;
	const handleClaim = () => mutate();
	
	return (
		<div
			className={cx(
				'md:mx-0 bg-primaryLighter border border-gray-800 bg-cover bg-no-repeat rounded-lg p-3 md:p-7 lg:p-8 flex flex-row justify-between md:items-center',
				className,
			)}
		>
			<div
				className={cx({
					'animate-pulse blur-sm': isStakedLoading || isClaimableLoading,
				})}
			>
				{staked === 0n ? (
					<h2 className={'font-semibold whitespace-nowrap md:text-xl'}>
						{t('conservative.earn')}
					</h2>
				) : (
					<div
						className={'font-semibold text-lg flex flex-row gap-2 items-center'}
					>
						{t('conservative.profitTitle')}
						<BetValue value={valueToNumber(claimable)} withIcon/>
					</div>
				)}
				<div className={'text-gray-400 text-xs mt-2 flex gap-1'}>
					<div
						className={
							'text-yellow-400 font-medium flex flex-row items-center gap-1'
						}
					>
						<BetValue
							value={(valueToNumber(balance) / 100) * share}
							precision={2}
							withIcon
						/>
					</div>
					{t('conservative.pending')}
				</div>
			</div>
			<button
				onClick={handleClaim}
				disabled={staked === 0n || claimable === 0n}
				className={
					'rounded-lg h-[52px] px-6 py-3 w-[90px] flex flex-row justify-center items-center text-sm md:text-lg font-medium bg-red-roulette  disabled:bg-gray-700 disabled:cursor-not-allowed'
				}
			>
				{loading ? (
					<Loader className={'h-5 w-5 animate-spin'}/>
				) : (
					t('conservative.unstake')
				)}
			</button>
		</div>
	);
};

export default Claim;
