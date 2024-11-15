import { useGetTotalConservativeDistribution } from '@/src/lib/query/statistics';
import { Bet } from '@betfinio/ui/dist/icons';
import { type BarTooltipProps, ResponsiveBar } from '@nivo/bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'betfinio_app/select';
import cx from 'clsx';
import { DateTime } from 'luxon';
import millify from 'millify';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const CYCLE_LENGTH_MS = 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds
const OFFSET_MS = 1000 * 60 * 60 * 36; // 36 hours in milliseconds

// Calculate the current cycle ID
const cycleId = Math.floor((Date.now() - OFFSET_MS) / CYCLE_LENGTH_MS);

// Calculate the start timestamp for the current cycle
const cycleStart = cycleId * CYCLE_LENGTH_MS + OFFSET_MS;

// Function to get the previous N cycles (backwards)
const getCyclesBack = (numCycles: number) => {
	const cycles = [];
	let currentCycleStart = cycleStart;

	for (let i = 0; i < numCycles; i++) {
		// Calculate start and end of the current cycle
		const cycleEnd = currentCycleStart + CYCLE_LENGTH_MS; // End of current cycle is start of the next cycle
		cycles.push({
			start: currentCycleStart / 1000,
			end: cycleEnd / 1000,
		});

		// Move to the previous cycle (subtract one cycle length)
		currentCycleStart -= CYCLE_LENGTH_MS;
	}

	return cycles.reverse(); // Reverse to get cycles in chronological order
};

// Get 10 cycles back
const cycles10Back = getCyclesBack(10).filter((cycle) => cycle.start < cycleStart / 1000);

export const ConservativeStakingPayouts: FC = () => {
	const { t } = useTranslation('staking', { keyPrefix: 'statistics' });

	const { data: totalDistribution } = useGetTotalConservativeDistribution(cycles10Back);
	return (
		<div className={'border border-border rounded-lg aspect-video h-[400px] w-full p-2'}>
			<div className={'text-lg flex flex-row justify-end'}>
				{/* <div className={"px-1"}>{t("conservativeStakingPayouts")}</div> */}
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
				colors={'hsl(var(--chart-1))'}
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
					{t('statistics.conservative')}
				</div>
				<div className="text-xs flex gap-1 items-center">
					{data.value.toLocaleString()}
					<Bet className={'w-3 h-3 text-accent-secondary-foreground'} />
				</div>
			</div>
		</div>
	);
};
