import { useCalculationsStat as useCalculationsStatConservative } from '@/src/lib/query/conservative';
import { Bet } from '@betfinio/ui/dist/icons';
import { type PointSymbolProps, ResponsiveLine, type Serie, type SliceTooltipProps } from '@nivo/line';
import { useTotalProfitStat as useTotalProfitStatConservative } from 'betfinio_app/lib/query/conservative';
import { useTotalProfitStat as useTotalProfitStatDynamic } from 'betfinio_app/lib/query/dynamic';
import type { Stat, Timeframe } from 'betfinio_app/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'betfinio_app/select';
import cx from 'clsx';
import { DateTime } from 'luxon';
import millify from 'millify';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Revenues = () => {
	const { t } = useTranslation('staking');
	const [timeframe, setTimeframe] = useState<Timeframe>('day');
	const { data: conservative = [] } = useTotalProfitStatConservative(timeframe);
	const { data: dynamic = [] } = useTotalProfitStatDynamic(timeframe);
	const { data: calcConservative = [] } = useCalculationsStatConservative(timeframe);

	const conservativeData = useMemo(() => {
		return [
			...conservative.map((item: Stat) => {
				return {
					x: item.time,
					y: Math.floor(item.value),
					calc: false,
				};
			}),
			...calcConservative.map((item: Stat) => {
				return {
					x: item.time,
					y: Math.floor(item.value),
					calc: true,
				};
			}),
		];
	}, [conservative, calcConservative]);

	const dynamicData = useMemo(() => {
		return dynamic.map((item: Stat) => {
			return {
				x: item.time,
				y: Math.floor(item.value),
			};
		});
	}, [dynamic]);

	const data: Serie[] = [
		{
			id: 'Conservative',
			color: '#facc15',
			data: conservativeData.sort((a, b) => a.x - b.x),
		},
		{
			id: 'Dynamic',
			color: '#6A6A9F',
			data: dynamicData.sort((a, b) => a.x - b.x),
		},
	];

	const handleChange = (val: Timeframe) => {
		setTimeframe(val);
	};
	return (
		<div className={'border border-gray-800 rounded-lg p-2 w-full h-[400px] pb-[40px]'}>
			<div className={'text-lg flex flex-row justify-between'}>
				<div className={'px-1'}>{t('statistics.totalRevenues')}</div>
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
				margin={{ top: 20, right: 30, bottom: 50, left: 50 }}
				curve={'monotoneX'}
				colors={{ datum: 'color' }}
				enableGridX={false}
				enableGridY={false}
				pointSymbol={(props: PointSymbolProps) => {
					return <circle r={props.datum.calc ? '5' : '0'} cx="0" cy="0" fill={props.color} />;
				}}
				axisTop={null}
				isInteractive={true}
				axisRight={null}
				axisLeft={{
					format: (value) => millify(value, { precision: 2 }),
				}}
				axisBottom={{
					format: (value) => DateTime.fromSeconds(value).toFormat(timeframe === 'hour' ? 'HH:mm' : 'dd.MM'),
					tickRotation: 45,
				}}
				yScale={{
					// min, max,
					type: 'linear',
				}}
				animate={true}
				enableTouchCrosshair={true}
				enableSlices={'x'}
				sliceTooltip={Tooltip}
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
						symbolBorderColor: 'rgba(255, 255, 255, .5)',
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

export default Revenues;

const Tooltip = ({ slice }: SliceTooltipProps) => {
	return (
		<div className={'flex flex-col gap-1 bg-primaryLighter rounded-lg text-white px-2 py-1 text-sm '}>
			<div className={'text-xs'}>{DateTime.fromSeconds(Number(slice.points[0].data.x)).toFormat('dd.MM HH:mm')}</div>
			{slice.points.map((point, id) => (
				<div className={'flex flex-row items-center  justify-between gap-3'} key={id}>
					<div className={cx('opacity-50')} style={{ color: point.color }}>
						{point.serieId}
					</div>
					<div className={'flex flex-row items-center gap-1'}>
						{point.data.y.toLocaleString()} <Bet className={'w-3 h-3'} />
					</div>
				</div>
			))}
		</div>
	);
};

const getLastFriday = () => {
	let lastFriday = DateTime.now().set({
		weekday: 5,
		hour: 12,
		minute: 0,
		second: 0,
		millisecond: 0,
	});

	// If it's Friday today, adjust to get the *previous* Friday
	if (lastFriday > DateTime.now()) {
		lastFriday = lastFriday.minus({ weeks: 1 });
	}
	return lastFriday;
};

const getTenFridaysFrom = (friday: DateTime) => {
	const fridays = [];
	for (let i = 0; i < 10; i++) {
		fridays.push(friday.minus({ weeks: i }));
	}
	return fridays.map((f) => f.toSeconds());
};
