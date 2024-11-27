import { ArcElement, Chart as ChartJS, type ChartOptions, Legend, Tooltip } from 'chart.js';
import type { FC } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { cn } from '@betfinio/components';
import millify from 'millify';

ChartJS.register(ArcElement, Tooltip, Legend);
const initialLabels = ['01', '02', '03', '04', '05', '06', '07'];

const Chart: FC<{
	values: number[];
	labels: string[];
	className?: string;
	label?: string;
	color?: string;
}> = ({ labels = initialLabels, color = '#22c55e', values, className = '', label = 'value' }) => {
	const options = {
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: false,
			},
		},
		maintainAspectRatio: true,
		scales: {
			y: {
				ticks: {
					callback: (value: number) => millify(value, { precision: 2 }),
				},
			},
		},
	} as ChartOptions<'line'>;

	const data = {
		labels,
		datasets: [
			{
				label: label,
				data: values,
				borderColor: color,
			},
		],
	};
	return <Line options={options} data={data} className={cn(className)} />;
};

export default Chart;
