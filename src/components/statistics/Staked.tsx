import { Bet } from '@betfinio/ui/dist/icons';
import { ResponsiveLine, type Serie, type SliceTooltipProps } from '@nivo/line';
import { useTotalStakedStat as useTotalStakedStatConservative } from 'betfinio_app/lib/query/conservative';
import { useTotalStakedStat as useTotalStakedStatDynamic } from 'betfinio_app/lib/query/dynamic';
import type { Stat, Timeframe } from 'betfinio_app/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'betfinio_app/select';
import cx from 'clsx';
import { DateTime } from 'luxon';
import millify from 'millify';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Staked = () => {
	const { t } = useTranslation('staking');
	const [timeframe, setTimeframe] = useState<Timeframe>('day');
	const { data: conservative = [] } = useTotalStakedStatConservative(timeframe);
	const { data: dynamic = [] } = useTotalStakedStatDynamic(timeframe);

	const conservativeData = useMemo(() => {
		return conservative.map((item: Stat) => {
			return {
				x: item.time,
				y: item.value,
			};
		});
	}, [conservative]);

	const dynamicData = useMemo(() => {
		return dynamic.map((item: Stat) => {
			return {
				x: item.time,
				y: item.value,
			};
		});
	}, [dynamic]);

	const data: Serie[] = [
		{
			id: 'Conservative',
			color: '#facc15',
			data: conservativeData,
		},
		{
			id: 'Dynamic',
			color: '#6A6A9F',
			data: dynamicData,
		},
	];

	const handleChange = (val: Timeframe) => {
		setTimeframe(val);
	};

	return (
		<div className={'border border-gray-800 rounded-lg aspect-video p-2'}>
			<div className={'text-lg flex flex-row justify-between'}>
				<div className={'px-1'}>{t('statistics.totalStaked')}</div>
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
				pointSize={0}
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

export default Staked;

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
