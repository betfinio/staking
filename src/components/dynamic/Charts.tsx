import Chart from '@/src/components/shared/Chart';
import { useTotalProfitStat, useTotalStakedStat, useTotalStakersStat } from 'betfinio_app/lib/query/dynamic';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'betfinio_app/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'betfinio_app/tabs';
import { DateTime } from 'luxon';
import { useState } from 'react';

import type { Timeframe } from 'betfinio_app/lib/types';
import { useTranslation } from 'react-i18next';

const Charts = () => {
	const { t } = useTranslation('staking');
	const [timeframe, setTimeframe] = useState<Timeframe>('day');
	const { data: totalStaked = [], error } = useTotalStakedStat(timeframe);
	const { data: totalStakers = [] } = useTotalStakersStat(timeframe);
	const { data: totalProfit = [] } = useTotalProfitStat(timeframe);
	const handleChange = (val: Timeframe) => {
		setTimeframe(val);
	};
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
							</SelectContent>
						</Select>
					</div>
				</TabsList>

				<TabsContent value={'staked'} className={'grow'}>
					<Chart
						label={t('dynamic.chart.totalStaked')}
						className={'h-full'}
						color={'#facc15'}
						values={totalStaked.map((e) => e.value)}
						labels={totalStaked.map((e) => DateTime.fromMillis(e.time * 1000).toFormat(timeframe === 'hour' ? 'HH:mm' : 'dd.MM'))}
					/>
				</TabsContent>
				<TabsContent value={'stakers'} className={'grow'}>
					<Chart
						label={t('dynamic.chart.totalStakers')}
						color={'#6A6A9F'}
						values={totalStakers.map((e) => e.value)}
						labels={totalStakers.map((e) => DateTime.fromMillis(e.time * 1000).toFormat(timeframe === 'hour' ? 'HH:mm' : 'dd.MM'))}
					/>
				</TabsContent>
				<TabsContent value={'revenues'} className={'grow'}>
					<Chart
						label={t('dynamic.chart.totalRevenue')}
						values={totalProfit.map((e) => e.value)}
						labels={totalProfit.map((e) => DateTime.fromMillis(e.time * 1000).toFormat(timeframe === 'hour' ? 'HH:mm' : 'dd.MM'))}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
};
export default Charts;
