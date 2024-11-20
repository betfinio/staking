import Chart from '@/src/components/shared/Chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'betfinio_app/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'betfinio_app/tabs';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';

import type { Timeframe } from 'betfinio_app/lib/types';
import { useRevenueStatisticsCurrent, useStakedStatisticsCurrent, useStakersStatisticsCurrent, useStakingStatistics } from 'betfinio_statistics/query';
import { getDynamicCycles } from 'betfinio_statistics/utils';
import { useTranslation } from 'react-i18next';

const { cycleStart } = getDynamicCycles();

const Charts = () => {
	const { t } = useTranslation('staking');
	const [timeframe, setTimeframe] = useState<Timeframe>('day');

	const { data: currentStakedStatistic } = useStakedStatisticsCurrent();
	const { data: currentStakersStatistic } = useStakersStatisticsCurrent();
	const { data: currentRevenueStatistic } = useRevenueStatisticsCurrent();

	const { data: statistics = [] } = useStakingStatistics(timeframe, 'dynamic', cycleStart);
	const handleChange = (val: Timeframe) => {
		setTimeframe(val);
	};
	const timeFormat = timeframe === 'hour' ? 'HH:mm' : 'dd.MM';
	const totalStaked = useMemo(() => {
		const calculated = {
			values: statistics.map((e) => e.dynamicTotalStaked),
			labels: statistics.map((e) => DateTime.fromSeconds(e.timestamp).toFormat(timeFormat)),
		};

		if (currentStakedStatistic) {
			calculated.labels.push(DateTime.fromSeconds(currentStakedStatistic.timestamp).toFormat(timeFormat));
			calculated.values.push(currentStakedStatistic.dynamicTotalStaking);
		}
		return calculated;
	}, [currentStakedStatistic, statistics]);
	const totalStakers = useMemo(() => {
		const calculated = {
			values: statistics.map((e) => e.dynamicTotalStakers),
			labels: statistics.map((e) => DateTime.fromSeconds(e.timestamp).toFormat(timeFormat)),
		};

		if (currentStakersStatistic) {
			calculated.labels.push(DateTime.fromSeconds(currentStakersStatistic.timestamp).toFormat(timeFormat));
			calculated.values.push(currentStakersStatistic.dynamicTotalStakers);
		}
		return calculated;
	}, [currentStakersStatistic, statistics]);
	const totalRevenue = useMemo(() => {
		const calculated = {
			values: statistics.map((e) => e.dynamicTotalRevenue),
			labels: statistics.map((e) => DateTime.fromSeconds(e.timestamp).toFormat(timeFormat)),
		};

		if (currentRevenueStatistic) {
			calculated.labels.push(DateTime.fromSeconds(currentRevenueStatistic.timestamp).toFormat(timeFormat));
			calculated.values.push(currentRevenueStatistic.dynamicTotalRevenue);
		}
		return calculated;
	}, [currentRevenueStatistic, statistics]);

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
					<Chart label={t('dynamic.chart.totalStaked')} className={'h-full'} color={'#facc15'} {...totalStaked} />
				</TabsContent>
				<TabsContent value={'stakers'} className={'grow'}>
					<Chart label={t('dynamic.chart.totalStakers')} color={'#6A6A9F'} {...totalStakers} />
				</TabsContent>
				<TabsContent value={'revenues'} className={'grow'}>
					<Chart label={t('dynamic.chart.totalRevenue')} {...totalRevenue} />
				</TabsContent>
			</Tabs>
		</div>
	);
};
export default Charts;
