import { useStakersStatisticsCurrent, useStakingStatistics } from '@/src/lib/query/statistics';
import { ResponsiveLine, type Serie, type SliceTooltipProps } from '@nivo/line';

import type { Timeframe } from 'betfinio_app/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'betfinio_app/select';
import cx from 'clsx';
import { UserIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import millify from 'millify';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Stakers = () => {
	const { t } = useTranslation('staking');
	const [timeframe, setTimeframe] = useState<Timeframe>('day');
	const { data: statistics = [] } = useStakingStatistics(timeframe);
	const { data: currentStatistic } = useStakersStatisticsCurrent();

	const conservativeData = useMemo(() => {
		if (!currentStatistic) return [];
		const calculated = statistics.map((item) => {
			return {
				y: item.conservativeTotalStakers,
				x: item.timestamp,
			};
		});

		calculated.push({ x: currentStatistic.timestamp, y: currentStatistic?.conservativeTotalStakers });

		return calculated;
	}, [statistics, currentStatistic]);

	const dynamicData = useMemo(() => {
		if (!currentStatistic) return [];

		const calculated = statistics.map((item) => {
			return {
				y: item.dynamicTotalStakers,
				x: item.timestamp,
			};
		});
		calculated.push({ x: currentStatistic.timestamp, y: currentStatistic.dynamicTotalStakers });

		return calculated;
	}, [statistics, currentStatistic]);

	const data: Serie[] = [
		{
			id: t('statistics.conservative'),
			color: 'hsl(var(--chart-1))',
			data: conservativeData,
		},
		{
			id: t('statistics.dynamic'),
			color: 'hsl(var(--chart-2))',
			data: dynamicData,
		},
	];

	const handleChange = (val: Timeframe) => {
		setTimeframe(val);
	};

	return (
		<div className={'border border-border rounded-lg aspect-video p-2'}>
			<div className={'text-lg flex flex-row justify-between'}>
				<div className={'px-1'}>{t('statistics.totalStakers')}</div>
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
			<ResponsiveLine
				data={data}
				key={timeframe}
				margin={{ top: 20, right: 30, bottom: 50, left: 50 }}
				curve={'monotoneX'}
				colors={{ datum: 'color' }}
				enableGridX={false}
				enableGridY={false}
				axisTop={null}
				axisRight={null}
				axisLeft={{
					format: (value) => millify(value, { precision: 2 }),
				}}
				axisBottom={{
					format: (value) => DateTime.fromSeconds(value).toFormat(timeframe === 'hour' ? 'HH:mm' : 'dd.MM'),
					tickRotation: 45,
				}}
				yScale={{
					//   min,
					//   max,
					type: 'linear',
				}}
				animate={true}
				enableTouchCrosshair={true}
				enableSlices={'x'}
				sliceTooltip={Tooltip}
				pointSize={0}
				useMesh={true}
				legends={[
					{
						anchor: 'bottom',
						direction: 'row',
						translateY: 50,
						itemsSpacing: 0,
						itemDirection: 'left-to-right',
						itemWidth: 80,
						itemHeight: 20,
						itemOpacity: 0.75,
						toggleSerie: true,
						symbolSize: 12,
						symbolShape: 'circle',
						symbolBorderColor: 'rgba(0, 0, 0, .5)',
						effects: [
							{
								on: 'hover',
								style: {
									itemBackground: 'rgba(0, 0, 0, .03)',
									itemOpacity: 1,
								},
							},
						],
					},
				]}
			/>
		</div>
	);
};

export default Stakers;

const Tooltip = ({ slice }: SliceTooltipProps) => {
	return (
		<div className={'flex flex-col gap-1 bg-card rounded-lg  px-2 py-1 text-sm '}>
			<div className={'text-xs'}>{DateTime.fromSeconds(Number(slice.points[0].data.x)).toFormat('dd.MM HH:mm')}</div>
			{slice.points.map((point, id) => (
				<div className={'flex flex-row items-center  justify-between gap-3'} key={id}>
					<div className={cx('opacity-50')} style={{ color: point.color }}>
						{point.serieId}
					</div>
					<div className={'flex flex-row items-center gap-1'}>
						{point.data.y.toLocaleString()} <UserIcon className={'w-4 h-4'} />
					</div>
				</div>
			))}
		</div>
	);
};
