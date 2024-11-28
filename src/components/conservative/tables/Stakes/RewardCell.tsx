import { usePoolReward } from '@/src/lib/query/conservative';
import { valueToNumber } from '@betfinio/abi';
import { Bet } from '@betfinio/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';
import type { CellContext } from '@tanstack/react-table';
import type { Stake } from 'betfinio_app/lib/types';
import { useTranslation } from 'react-i18next';

export const RewardCell = (props: CellContext<Stake, bigint | undefined>) => {
	const { t } = useTranslation('staking', { keyPrefix: 'table' });
	const { data: reward = 0n } = usePoolReward(props.row.original.staker, props.row.original.pool);
	const poolAmount = Number(props.row.getValue('amount') as bigint);
	const percentage = Number(reward * 100n) / poolAmount;

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<div className={'text-succes font-bold'}>
					<TooltipTrigger>
						<span>{percentage.toFixed(2)}%</span>
					</TooltipTrigger>
				</div>
				<TooltipContent className={'text-foreground bg-card'}>
					{t('claimedRewards')}
					{/* <BetValue value={rewardDiff}/> */}
					<div className={'text-secondary-foreground font-bold flex items-center gap-1 justify-center'}>
						{valueToNumber(reward).toLocaleString()} <Bet />
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
