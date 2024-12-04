import { PUBLIC_CONSERVATIVE_STAKING_ADDRESS } from '@/src/globals';
import { useClaim, useClaimable, useStaked } from '@/src/lib/query/conservative';
import { ZeroAddress } from '@betfinio/abi';
import { valueToNumber } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Button } from '@betfinio/components/ui';
import { useTotalStaked } from 'betfinio_app/lib/query/conservative';
import { useBalance } from 'betfinio_app/lib/query/token';
import { Loader } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

interface ClaimProps {
	className: string;
}

const Claim: FC<ClaimProps> = ({ className }) => {
	const { t } = useTranslation('staking');
	const { address = ZeroAddress } = useAccount();
	const { data: staked = 0n, isLoading: isStakedLoading } = useStaked(address);
	const { data: claimable = 0n, isLoading: isClaimableLoading } = useClaimable(address);
	const { data: balance = 0n } = useBalance(PUBLIC_CONSERVATIVE_STAKING_ADDRESS);
	const { mutate, isPending: loading } = useClaim();
	const { data: totalStaked = 0n } = useTotalStaked();
	const share = (valueToNumber(staked) / (valueToNumber(totalStaked) || 1)) * 100;
	const handleClaim = () => mutate();

	return (
		<div
			className={cn(
				'md:mx-0 bg-card border border-border bg-cover bg-no-repeat rounded-lg p-3 md:p-7 lg:p-8 flex flex-row justify-between md:items-center',
				className,
			)}
		>
			<div
				className={cn({
					'animate-pulse blur-sm': isStakedLoading || isClaimableLoading,
				})}
			>
				{staked === 0n ? (
					<h2 className={'font-semibold whitespace-nowrap md:text-xl'}>{t('conservative.earn')}</h2>
				) : (
					<div className={'font-semibold text-lg flex flex-row gap-2 items-center'}>
						{t('conservative.profitTitle')}
						<BetValue value={valueToNumber(claimable)} withIcon />
					</div>
				)}
				<div className={'text-tertiary-foreground text-xs mt-2 flex gap-1'}>
					<div className={'text-secondary-foreground font-medium flex flex-row items-center gap-1'}>
						<BetValue value={(valueToNumber(balance) / 100) * share} precision={2} withIcon />
					</div>
					{t('conservative.pending')}
				</div>
			</div>

			<Button
				onClick={handleClaim}
				disabled={staked === 0n || claimable === 0n || loading}
				variant={'destructive'}
				className="px-4 py-3   flex text-base relative"
				size="freeSize"
			>
				<span
					className={cn({
						invisible: loading,
					})}
				>
					{t('conservative.unstake')}
				</span>
				{loading && <Loader className={'h-4 w-4 animate-spin absolute inset-0 m-auto'} />}
			</Button>
		</div>
	);
};

export default Claim;
