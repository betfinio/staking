import { valueToNumber } from '@betfinio/abi';
import { BetValue } from 'betfinio_app/BetValue';
import cx from 'clsx';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export interface SingleIngoProps {
	className?: string;
	label: string;
	subtitle?: string;
	amount: bigint | string;
	percent?: boolean;
	isLoading?: boolean;
}

const SingleIngo: FC<SingleIngoProps> = ({ className = '', label, amount, subtitle = '', percent = false, isLoading = false }) => {
	const amountNumber = Number(amount);
	const { t } = useTranslation('', { keyPrefix: 'staking' });
	const isSoon = label === t('games.soon');
	return (
		<div className={'relative'}>
			<div
				className={cx(
					'bg-primaryLighter border border-gray-800 rounded-md mx-auto col-span-1 w-full bg-top py-4 md:px-3 bg-no-repeat  flex flex-col items-center text-center justify-center gap-1',
					{ 'blur-sm brightness-50': isSoon },
					className,
				)}
			>
				<span className={'text-xs lg:text-base font-semibold'}>{isSoon ? 'Coming soon' : label}</span>
				<div className={'flex flex-row items-center justify-center gap-1 text-sm md:text-normal text-yellow-500'}>
					<div
						className={cx('font-medium text-sm flex justify-center flex-col items-center', {
							'animate-pulse blur-sm': isLoading,
						})}
					>
						{percent ? (
							isLoading ? (
								50
							) : amountNumber === 0 ? (
								0
							) : amountNumber < 1 ? (
								amountNumber < 0.0001 ? (
									'< 0.0000'
								) : (
									amountNumber.toFixed(4)
								)
							) : (
								amountNumber.toFixed(2)
							)
						) : (
							<BetValue value={valueToNumber(amount as bigint)} precision={2} withIcon />
						)}
						{percent && '%'}
						{subtitle && <div className={'text-gray-400 text-xs mt-1'}>{subtitle}</div>}
					</div>
				</div>
			</div>
			{isSoon && <div className={'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-400 font-bold'}>Soon</div>}
		</div>
	);
};

export default SingleIngo;
