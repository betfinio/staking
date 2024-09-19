import { valueToNumber } from '@betfinio/abi';
import { Bet } from '@betfinio/ui/dist/icons';
import type { CellContext } from '@tanstack/react-table';
import type { Stake } from 'betfinio_app/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'betfinio_app/tooltip';

export const RewardCell = (props: CellContext<Stake, bigint | undefined>) => {
	const poolReward = props.getValue() ?? 0n;
	const poolAmount = Number(props.row.getValue('amount') as bigint);

	const percentage = Number(poolReward * 100n) / poolAmount;

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<div className={'text-green-400 font-bold'}>
					<TooltipTrigger>
						<span>{percentage.toFixed(2)}%</span>
					</TooltipTrigger>
				</div>
				<TooltipContent className={'text-white bg-black'}>
					Claimed rewards:
					{/* <BetValue value={rewardDiff}/> */}
					<div className={'text-yellow-400 font-bold flex items-center gap-1 justify-center'}>
						{valueToNumber(poolReward).toLocaleString()} <Bet />
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
