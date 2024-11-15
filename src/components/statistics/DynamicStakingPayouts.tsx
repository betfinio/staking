import { useGetTotalDynamicDistribution } from '@/src/lib/query/statistics';
import { Bet } from '@betfinio/ui/dist/icons';
import { type BarTooltipProps, ResponsiveBar } from '@nivo/bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'betfinio_app/select';
import cx from 'clsx';
import { DateTime } from 'luxon';
import millify from 'millify';
import { useTranslation } from 'react-i18next';

const starts = [1715601600];

// Constants
const secondsInWeek = 60 * 60 * 24 * 7; // seconds in one week
const fourWeeksInterval = secondsInWeek * 4; // 4 weeks in seconds

// Function to generate full 4-week periods until the current time
const generateFullFourWeekPeriods = (start: number, currentTime: number) => {
	const fullPeriods: number[] = [];
	let currentStart = start;

	// Loop to generate full 4-week intervals until the current time
	while (currentStart + fourWeeksInterval <= currentTime + fourWeeksInterval) {
		fullPeriods.push(currentStart);
		currentStart += fourWeeksInterval;
	}

	return fullPeriods;
};

const now = Date.now() / 1000; // Current time in seconds

//  full 4-week periods up until the current time
const fullFourWeekPeriods = generateFullFourWeekPeriods(starts[0], now);

// The last full period's start and end for cycle calculation
const cycleStart = fullFourWeekPeriods[fullFourWeekPeriods.length - 1] * 1000; // Start of the last full cycle (in ms)

const transformedCycles = fullFourWeekPeriods.map((startTime, index) => {
	const start = startTime; // Convert to milliseconds
	const end = index < fullFourWeekPeriods.length - 1 ? fullFourWeekPeriods[index + 1] : Math.floor(Date.now() / 1000);
	return { start, end };
});
// Filter out cycles that have a start time after the current cycle's start
const validCycles = transformedCycles.filter((cycle) => cycle.start < cycleStart / 1000);

export const DynamicStakingPayouts = () => {
	const { t } = useTranslation('staking', { keyPrefix: 'statistics' });
	const { data: totalDistribution } = useGetTotalDynamicDistribution(validCycles);

	return (
		<div className={'border border-border rounded-lg aspect-video h-[400px] w-full p-2'}>
			<div className={'text-lg flex flex-row justify-end'}>
				{/* <div className={"px-1"}>{t("dynamicStakingPayouts")}</div> */}
				<Select defaultValue={'cycle'}>
					<SelectTrigger className={'max-w-[100px]'}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="cycle">1 {t('cycle')}</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<ResponsiveBar
				data={totalDistribution ?? []}
				keys={['value']}
				indexBy="label"
				enableGridX={false}
				enableGridY={false}
				borderRadius={8}
				margin={{ top: 20, right: 30, bottom: 70, left: 50 }}
				padding={0.3}
				axisBottom={{
					format: (value) => DateTime.fromSeconds(value).toFormat('dd.MM'),
					tickRotation: 45,
				}}
				axisLeft={{
					format: (value) => millify(value, { precision: 2 }),
				}}
				tooltip={Tooltip}
				labelSkipWidth={12}
				labelSkipHeight={12}
				valueFormat={() => ''}
				colors={'hsl(var(--chart-2))'}
			/>
		</div>
	);
};

// Custom Tooltip Component
const Tooltip = (props: BarTooltipProps<{ label: number; value: number }>) => {
	const { t } = useTranslation('staking');
	const { color, data } = props;

	return (
		<div className="flex flex-col gap-1 bg-card rounded-lg px-2 py-1 text-sm">
			{/* Display the formatted date */}
			<div className="text-xs">{DateTime.fromSeconds(data.label).toFormat('dd.MM')}</div>
			<div className="flex justify-between items-center gap-2">
				<div className={cx(' ')} style={{ color: color }}>
					{t('statistics.dynamic')}
				</div>
				<div className="text-xs flex gap-1 items-center">
					{data.value.toLocaleString()}
					<Bet className={'w-3 h-3 text-accent-secondary-foreground'} />
				</div>
			</div>
		</div>
	);
};
