import {StakingType} from "@/src/lib/types.ts";
import {FC} from "react";
import SharedGameBlock from "@/src/components/shared/SharedGameBlock";
import {useTranslation} from "react-i18next";
import {valueToNumber} from "@betfinio/abi";
import {useStaked as useStakedC, useProfit as useProfitC, useTotalStaked as useTotalStakedC} from "@/src/lib/query/conservative";
import {useStaked as useStakedD, useTotalStaked as useTotalStakedD, useClaimed} from "@/src/lib/query/dynamic";
import {useAccount} from "wagmi";
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from "betfinio_app/dialog";
import ConservativeStakingInfo from "@/src/components/conservative/StakingInfo";
import DynamicStakingInfo from "@/src/components/dynamic/StakingInfo";
import StatisticsModal from "@/src/components/conservative/StatisticsModal.tsx";
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';


const InfoBlock: FC<{ type: StakingType }> = ({type}) => {
	const {t} = useTranslation('', {keyPrefix: 'staking'})
	
	const {address} = useAccount()
	
	const {data: stakedC = 0n, isLoading: isStakedLoadingC} = useStakedC(address!)
	const {data: profitC = 0n, isLoading: isProfitLoadingC} = useProfitC(address!)
	const {data: totalStakedC = 0n, isLoading: isTotalLoadingC} = useTotalStakedC()
	const {data: stakedD = 0n, isLoading: isStakedLoadingD} = useStakedD(address!)
	const {data: claimed = 0n, isLoading: isClaimedLoading} = useClaimed(address!)
	const {data: totalStakedD = 0n, isLoading: isTotalLoadingD} = useTotalStakedD()
	const staked = type === 'conservative' ? stakedC : stakedD
	const profit = type === 'conservative' ? profitC : claimed
	const totalStaked = type === 'conservative' ? totalStakedC : totalStakedD
	const isStakedLoading = type === 'conservative' ? isStakedLoadingC : isStakedLoadingD
	const isProfitLoading = type === 'conservative' ? isProfitLoadingC : isClaimedLoading
	const isTotalLoading = type === 'conservative' ? isTotalLoadingC : isTotalLoadingD
	
	const share = valueToNumber(staked) / (valueToNumber(totalStaked) || 1) * 100
	
	return <div className={'col-span-2 md:col-span-1 flex flex-col gap-2 lg:gap-4 justify-between'}>
		<SharedGameBlock games={[
			{amount: staked, label: t('stats.staking'), isLoading: isStakedLoading},
			{
				amount: String(share),
				percent: true,
				label: t('stats.share'),
				isLoading: isStakedLoading || isTotalLoading
			},
			{amount: profit, label: t('stats.earnings'), isLoading: isProfitLoading},
		]}/>
		<Dialog>
			<DialogTrigger>
				{type === 'conservative' && <ConservativeStakingInfo/>}
				{type === 'dynamic' && <DynamicStakingInfo/>}
			</DialogTrigger>
			<DialogContent className={'w-full min-h-[400px]'} aria-describedby={undefined}>
				<StatisticsModal/>
				<VisuallyHidden.Root asChild>
					<DialogTitle/>
				</VisuallyHidden.Root>
			</DialogContent>
		</Dialog>
	</div>
}

export default InfoBlock;