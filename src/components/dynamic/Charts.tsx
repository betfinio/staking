import Chart from '@/src/components/shared/Chart';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';
import { useMemo, useState } from 'react';

import type { Timeframe } from '@/src/lib/types';
import { cn } from '@betfinio/components';
import { useStakingStatistics } from 'betfinio_statistics/query';
import { getDynamicCycles } from 'betfinio_statistics/utils';
import { useTranslation } from 'react-i18next';

const { cycleStart } = getDynamicCycles();
const margin = { top: 20, right: 20, bottom: 40, left: 40 };

const Charts = () => {
	const { t } = useTranslation('staking');
	const [timeframe, setTimeframe] = useState<Timeframe>('day');

	const { data: statistics = [], isLoading } = useStakingStatistics(timeframe, 'dynamic', cycleStart);
	const handleChange = (val: Timeframe) => {
		setTimeframe(val);
	};

	const slicedStatistics = useMemo(() => {
		return statistics.slice(-20);
	}, [statistics]);
	const timeFormat = timeframe === 'hour' ? 'HH:mm' : 'dd.MM';
	const totalStaked = useMemo(() => {
		return {
			values: slicedStatistics.map((e) => e.dynamicTotalStaked),
			labels: slicedStatistics.map((e) => e.timestamp),
		};
	}, [statistics]);
	const totalStakers = useMemo(() => {
		return {
			values: slicedStatistics.map((e) => e.dynamicTotalStakers),
			labels: slicedStatistics.map((e) => e.timestamp),
		};
	}, [statistics]);
	const totalRevenue = useMemo(() => {
		return {
			values: slicedStatistics.map((e) => e.dynamicTotalRevenue),
			labels: slicedStatistics.map((e) => e.timestamp),
		};
	}, [statistics]);

	return (
		<div className={'flex flex-col h-full'}>
			<Tabs defaultValue="staked" className={'grow flex flex-col'}>
				<TabsList className={'flex flex-row gap-2 text-sm'}>
					<TabsTrigger value={'staked'}>{t('dynamic.staked')}</TabsTrigger>
					<TabsTrigger value={'stakers'}>{t('dynamic.stakers')}</TabsTrigger>
					<TabsTrigger value={'revenues'}>{t('dynamic.revenues')}</TabsTrigger>
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
						timeFormat={timeFormat}
						label={t('dynamic.chart.totalStaked')}
						className={cn('h-full', {
							blur: isLoading,
						})}
						color={'hsl(var(--chart-1))'}
						{...totalStaked}
					/>
				</TabsContent>
				<TabsContent value={'stakers'} className={'grow'}>
					<Chart
						margin={margin}
						timeFormat={timeFormat}
						label={t('dynamic.chart.totalStakers')}
						className={cn({
							blur: isLoading,
						})}
						color={'hsl(var(--chart-2))'}
						{...totalStakers}
					/>
				</TabsContent>
				<TabsContent value={'revenues'} className={'grow'}>
					<Chart
						margin={margin}
						timeFormat={timeFormat}
						label={t('dynamic.chart.totalRevenue')}
						className={cn({
							blur: isLoading,
						})}
						color={'hsl(var(--success))'}
						{...totalRevenue}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
};
export default Charts;
