import ConservativeStakingInfo from '@/src/components/conservative/StakingInfo';
import StatisticsModal from '@/src/components/conservative/StatisticsModal.tsx';
import DynamicStatisticsModal from '@/src/components/dynamic/StatisticsModal.tsx';
import DynamicStakingInfo from '@/src/components/dynamic/StakingInfo';
import SharedGameBlock from '@/src/components/shared/SharedGameBlock';
import {
	useProfit as useProfitC,
	useStaked as useStakedC,
} from '@/src/lib/query/conservative';
import {useClaimed, useStaked as useStakedD,} from '@/src/lib/query/dynamic';
import {useTotalStaked as useTotalStakedC} from "betfinio_app/lib/query/conservative"
import {useTotalStaked as useTotalStakedD} from "betfinio_app/lib/query/dynamic"
import type {StakingType} from '@/src/lib/types.ts';
import {valueToNumber} from '@betfinio/abi';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {Dialog, DialogContent, DialogTitle, DialogTrigger,} from 'betfinio_app/dialog';
import type {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {useAccount} from 'wagmi';

const InfoBlock: FC<{ type: StakingType }> = ({type}) => {
	const {t} = useTranslation('', {keyPrefix: 'staking'});
	
	const {address} = useAccount();
	
	const {data: stakedC = 0n, isLoading: isStakedLoadingC} = useStakedC(
		address!,
	);
	const {data: profitC = 0n, isLoading: isProfitLoadingC} = useProfitC(
		address!,
	);
	const {data: totalStakedC = 0n, isLoading: isTotalLoadingC} =
		useTotalStakedC();
	const {data: stakedD = 0n, isLoading: isStakedLoadingD} = useStakedD(
		address!,
	);
	
	const {data: claimed = 0n, isLoading: isClaimedLoading} = useClaimed(
		address!,
	);
	const {data: totalStakedD = 0n, isLoading: isTotalLoadingD} =
		useTotalStakedD();
	const staked = type === 'conservative' ? stakedC : stakedD;
	const profit = type === 'conservative' ? profitC : claimed;
	const totalStaked = type === 'conservative' ? totalStakedC : totalStakedD;
	const isStakedLoading =
		type === 'conservative' ? isStakedLoadingC : isStakedLoadingD;
	const isProfitLoading =
		type === 'conservative' ? isProfitLoadingC : isClaimedLoading;
	const isTotalLoading =
		type === 'conservative' ? isTotalLoadingC : isTotalLoadingD;
	
	const share =
		(valueToNumber(staked) / (valueToNumber(totalStaked) || 1)) * 100;
	
	
	return (
		<div
			className={
				'col-span-2 md:col-span-1 flex flex-col gap-2 lg:gap-4 justify-between'
			}
		>
			<SharedGameBlock
				games={[
					{
						amount: staked,
						label: t('stats.staking'),
						isLoading: isStakedLoading,
					},
					{
						amount: String(share),
						percent: true,
						label: t('stats.share'),
						isLoading: isStakedLoading || isTotalLoading,
					},
					{
						amount: profit,
						label: t('stats.earnings'),
						isLoading: isProfitLoading,
					},
				]}
			/>
			<Dialog>
				<DialogTrigger>
					{type === 'conservative' && <ConservativeStakingInfo/>}
					{type === 'dynamic' && <DynamicStakingInfo/>}
				</DialogTrigger>
				<DialogContent
					className={'w-full min-h-[400px] staking'}
					aria-describedby={undefined}
				>
					{type === 'conservative' ? <StatisticsModal/> : <DynamicStatisticsModal/>}
					<VisuallyHidden.Root asChild>
						<DialogTitle/>
					</VisuallyHidden.Root>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default InfoBlock;
