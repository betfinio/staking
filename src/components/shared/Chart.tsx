import { cn } from '@betfinio/components';
import { type Datum, type LineProps, ResponsiveLine, type SliceTooltipProps } from '@nivo/line';
import { DateTime } from 'luxon';
import millify from 'millify';
import { type FC, useEffect, useState } from 'react';

const initialLabels = ['01', '02', '03', '04', '05', '06', '07'];

const Chart: FC<{
	values: number[];
	labels: Array<string | number>;
	className?: string;
	label?: string;
	color?: string;

	timeFormat: string;
	margin?: LineProps['margin'];
}> = ({ labels = initialLabels, color = '#22c55e', values, className = '', label = 'value', margin, timeFormat }) => {
	const [data, setData] = useState<Datum[]>([]);

	useEffect(() => {
		setData(
			labels.map((label, index) => ({
				x: label,

				y: values[index],
			})),
		);
	}, [labels, values]);

	return (
		<div className={cn(className, 'aspect-video max-w-full h-full ')}>
			<ResponsiveLine
				enableGridX={false}
				enableGridY={false}
				data={[
					{
						id: label,
						color,
						data,
					},
				]}
				colors={[color]}
				margin={margin}
				xScale={{ type: 'point' }}
				axisBottom={{
					tickRotation: 45,
					format: (value) => DateTime.fromSeconds(value).toFormat(timeFormat),
				}}
				yScale={{
					type: 'linear',
					min: 'auto',
					max: 'auto',
				}}
				axisLeft={{
					tickSize: 5,
					tickPadding: 5,
					tickRotation: 0,
					format: (value) => millify(value, { precision: 2 }),
				}}
				xFormat={(value) => DateTime.fromSeconds(value as number).toFormat(timeFormat)}
				pointSize={8}
				pointColor={color}
				pointBorderWidth={2}
				pointBorderColor={{ from: 'serieColor' }}
				pointLabelYOffset={-12}
				animate={true}
				enableCrosshair={false}
				enableSlices={'x'}
				legends={[]}
				sliceTooltip={Tooltip}
			/>
		</div>
	);
};

const Tooltip = ({ slice }: SliceTooltipProps) => {
	const point = slice.points[0];

	return (
		<div className={'flex flex-col gap-1 bg-card rounded-lg  px-2 py-1 text-sm '}>
			<div className={'text-xs'}>{point.data.xFormatted}</div>

			<div className={'flex flex-row items-center  justify-between gap-3'}>
				<div className={cn('opacity-50')} style={{ color: point.color }}>
					{point.serieId}
				</div>
				<div className={'flex flex-row items-center gap-1'}>{point.data.y.toLocaleString()}</div>
			</div>
		</div>
	);
};

export default Chart;
