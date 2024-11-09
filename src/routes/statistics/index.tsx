import { BetTokenEmissionChart } from '@/src/components/statistics/BetTokenEmission';
import { ConservativeStakingPayouts } from '@/src/components/statistics/ConservativeStakingPayouts';
import { DynamicStakingPayouts } from '@/src/components/statistics/DynamicStakingPayouts';
import Revenues from '@/src/components/statistics/Revenues';
import { TotalAffiliatePaid } from '@/src/components/statistics/SmallCards/TotalAffiliatePaid';
import { TotalMembersCard } from '@/src/components/statistics/SmallCards/TotalMemebrsCard';
import { TotalPlayersCard } from '@/src/components/statistics/SmallCards/TotalPlayersCard';
import { TotalRevenueCard } from '@/src/components/statistics/SmallCards/TotalRevenueCard';
import { TotalStakedCard } from '@/src/components/statistics/SmallCards/TotalStakedCard';
import { TotalStakersCard } from '@/src/components/statistics/SmallCards/TotalStakersCard';
import Staked from '@/src/components/statistics/Staked';
import Stakers from '@/src/components/statistics/Stakers';
import { createFileRoute } from '@tanstack/react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'betfinio_app/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'betfinio_app/tabs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/statistics/')({
	component: StatisticsPage,
});

function StatisticsPage() {
	const { t } = useTranslation('staking');

	const [payoutsTab, setPayoutsTab] = useState('dynamicPayouts');

	return (
		<div className={'p-2 md:p-3 lg:p-4 flex flex-col gap-2 md:gap-3 lg:gap-4'}>
			<div className={'grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4'}>
				<TotalStakedCard />
				<TotalStakersCard />
				<TotalRevenueCard />
				<TotalMembersCard />
				<TotalPlayersCard />
				<TotalAffiliatePaid />
			</div>
			<div className={'grid grid-cols-1 gap-2 md:gap-3 lg:gap-4'}>
				<Revenues />
			</div>
			<div className={'grid grid-cols-1 gap-2 md:gap-3 lg:gap-4'}>
				<Tabs value={payoutsTab}>
					<TabsList className={'md:flex flex-row gap-2 text-sm hidden'}>
						<TabsTrigger onClick={() => setPayoutsTab('dynamicPayouts')} value={'dynamicPayouts'}>
							{t('statistics.dynamicStakingPayouts')}
						</TabsTrigger>
						<TabsTrigger onClick={() => setPayoutsTab('conservativePayouts')} value={'conservativePayouts'}>
							{t('statistics.conservativeStakingPayouts')}
						</TabsTrigger>
						<TabsTrigger onClick={() => setPayoutsTab('revenues')} value={'revenues'}>
							{t('statistics.totalRevenues')}
						</TabsTrigger>
					</TabsList>

					<Select value={payoutsTab} onValueChange={setPayoutsTab}>
						<SelectTrigger className={'min-w-[100px] md:hidden'}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="dynamicPayouts"> {t('statistics.dynamicStakingPayouts')}</SelectItem>
							<SelectItem value="conservativePayouts"> {t('statistics.conservativeStakingPayouts')}</SelectItem>
							<SelectItem value="revenues"> {t('statistics.totalRevenues')}</SelectItem>
						</SelectContent>
					</Select>
					<TabsContent value={'conservativePayouts'} className={'h-full'}>
						<ConservativeStakingPayouts />
					</TabsContent>
					<TabsContent value={'dynamicPayouts'} className={'h-full'}>
						<DynamicStakingPayouts />
					</TabsContent>
					<TabsContent value={'revenues'} className={'h-full'}>
						<Revenues />
					</TabsContent>
				</Tabs>
			</div>

			<div className={'grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 lg:gap-4'}>
				<Staked />
				<Stakers />
			</div>

			<div className={'grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 lg:gap-4'}>
				<BetTokenEmissionChart />
			</div>
		</div>
	);
}
