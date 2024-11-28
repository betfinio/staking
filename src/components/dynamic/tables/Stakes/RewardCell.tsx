import { useStakeReward } from '@/src/lib/query/dynamic';
import { ZeroAddress, valueToNumber } from '@betfinio/abi';
import { Bet } from '@betfinio/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';
import type { CellContext } from '@tanstack/react-table';
import type { Stake } from 'betfinio_app/lib/types';
import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';

export const RewardCell = (props: CellContext<Stake, bigint | undefined>) => {
	const { t } = useTranslation('staking');
	const pool = props.row.getValue('pool') as Address;
	const hash = props.row.original.hash as Address;

	const { address = ZeroAddress } = useAccount();
	const { data: reward = 0n, isLoading } = useStakeReward(address, pool, hash);
	const poolReward = props.getValue();
	const poolAmount = Number(props.row.getValue('amount') as bigint);

	const rewardDiff = reward - (poolReward ?? 0n);
	const percentage = Number(rewardDiff * 100n) / poolAmount;

	if (isLoading) return <Loader className={'h-5 w-5 animate-spin'} />;

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<div className={'text-success font-bold'}>
					<TooltipTrigger>
						<span>{percentage.toFixed(2)}%</span>
					</TooltipTrigger>
				</div>
				<TooltipContent className={'text-card-foreground bg-card'}>
					{t('table.claimedRewards')}:{/* <BetValue value={rewardDiff}/> */}
					<div className={'text-secondary-foreground font-bold flex items-center gap-1 justify-center'}>
						{valueToNumber(rewardDiff).toLocaleString()} <Bet />
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
