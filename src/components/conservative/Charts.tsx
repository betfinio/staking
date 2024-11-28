import Chart from '@/src/components/shared/Chart';
import type { Timeframe } from '@/src/lib/types';
import { getConservativeCycle } from '@/src/utils';
import { cn } from '@betfinio/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';
import { useRevenueStatisticsCurrent, useStakedStatisticsCurrent, useStakersStatisticsCurrent, useStakingStatistics } from 'betfinio_statistics/query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { cycleStart } = getConservativeCycle();
const margin = { top: 20, right: 20, bottom: 80, left: 60 };

const Charts = () => {
	const { t } = useTranslation('staking');
	const [timeframe, setTimeframe] = useState<Timeframe>('day');

	const { data: currentStakedStatistic, isLoading: isLoadingStakedStatistic } = useStakedStatisticsCurrent();
	const { data: currentStakersStatistic, isLoading: isLoadingStakersStatistic } = useStakersStatisticsCurrent();
	const { data: currentRevenueStatistic, isLoading: isLoadingRevenueStatistic } = useRevenueStatisticsCurrent();

	const { data: statistics = [], isLoading: isLoadingStatistics } = useStakingStatistics(timeframe, 'conservative', cycleStart);

	const slicedStatistics = useMemo(() => {
		return statistics.slice(-20);
	}, [statistics]);

	const isLoading = isLoadingStakedStatistic || isLoadingStakersStatistic || isLoadingRevenueStatistic || isLoadingStatistics;
	const handleChange = (val: Timeframe) => {
		setTimeframe(val);
	};

	const timeFormat = timeframe === 'hour' || timeframe === 'cycle' ? 'HH:mm' : 'dd.MM';

	const totalStaked = useMemo(() => {
		const calculated = {
			values: slicedStatistics.map((e) => e.conservativeTotalStaked),
			labels: slicedStatistics.map((e) => e.timestamp),
		};

		if (currentStakedStatistic) {
			calculated.values.push(currentStakedStatistic.conservativeTotalStaking);
			calculated.labels.push(currentStakedStatistic.timestamp);
		}
		return calculated;
	}, [currentStakedStatistic, statistics, timeframe]);
	const totalStakers = useMemo(() => {
		const calculated = {
			labels: slicedStatistics.map((e) => e.timestamp),
			values: slicedStatistics.map((e) => e.conservativeTotalStakers),
		};

		if (currentStakersStatistic) {
			calculated.labels.push(currentStakersStatistic.timestamp);
			calculated.values.push(currentStakersStatistic.conservativeTotalStakers);
		}
		return calculated;
	}, [currentStakersStatistic, statistics, timeframe]);
	const totalRevenue = useMemo(() => {
		const calculated = {
			labels: slicedStatistics.map((e) => e.timestamp),
			values: slicedStatistics.map((e) => e.conservativeTotalRevenue),
		};

		if (currentRevenueStatistic) {
			calculated.labels.push(currentRevenueStatistic.timestamp);
			calculated.values.push(currentRevenueStatistic.conservativeTotalRevenue);
		}
		return calculated;
	}, [currentRevenueStatistic, statistics, timeframe]);
	return (
		<div className={'flex flex-col col-span-2 md:col-span-1'}>
			<Tabs defaultValue="staked">
				<TabsList className={'flex flex-row gap-2 text-sm'}>
					<TabsTrigger value={'staked'}>{t('conservative.staked')}</TabsTrigger>
					<TabsTrigger value={'stakers'}>{t('conservative.stakers')}</TabsTrigger>
					<TabsTrigger value={'revenues'}>{t('conservative.revenues')}</TabsTrigger>
					<div className={'flex-grow flex justify-end'}>
						<Select defaultValue={'day'} onValueChange={handleChange}>
							<SelectTrigger className={'max-w-[100px]'}>
								<SelectValue placeholder="Timeframe" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="hour">1 {t('hour')}</SelectItem>
								<SelectItem value="day">1 {t('day')}</SelectItem>
								<SelectItem value="week">1 {t('week')}</SelectItem>
								<SelectItem value="cycle">1 {t('cycle')}</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</TabsList>

				<TabsContent value={'staked'} className={'grow'}>
					<Chart
						margin={margin}
						label={t('conservative.chart.totalStaked')}
						className={cn('h-full', {
							blur: isLoading,
						})}
						color={'hsl(var(--chart-1))'}
						timeFormat={timeFormat}
						{...totalStaked}
					/>
				</TabsContent>
				<TabsContent value={'stakers'} className={'grow'}>
					<Chart
						margin={margin}
						className={cn({
							blur: isLoading,
						})}
						label={t('conservative.chart.totalStakers')}
						color={'hsl(var(--chart-2))'}
						timeFormat={timeFormat}
						{...totalStakers}
					/>
				</TabsContent>
				<TabsContent value={'revenues'} className={'grow'}>
					<Chart
						margin={margin}
						className={cn({
							blur: isLoading,
						})}
						label={t('conservative.chart.totalRevenue')}
						timeFormat={timeFormat}
						{...totalRevenue}
						color={'hsl(var(--success))'}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
};
export default Charts;
