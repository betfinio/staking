import { useGetCurrentDistribution } from '@/src/lib/query/statistics';
import { Bet } from '@betfinio/ui/dist/icons';
import { type PieTooltipProps, ResponsivePie } from '@nivo/pie';
import { cn, useMediaQuery } from 'betfinio_app/lib/utils';
import millify from 'millify';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export interface IDataPoint {
	id: string;
	label: string;
	value: number;
	color: string;
	textColor: string;
	legendColor: string;
}

export const BetTokenCurrentDistribution = () => {
	const { t } = useTranslation('staking', { keyPrefix: 'statistics' });
	const { data: currentDistribution = [], isLoading } = useGetCurrentDistribution();
	const { isTablet, isMobile } = useMediaQuery();
	const isTabletOrMobile = isTablet || isMobile;
	const data: IDataPoint[] = useMemo(
		() => [
			{
				id: 'bonusPool',
				label: t('bonusPool'),
				value: 1,
				color: 'hsl(var(--chart-2))',
				textColor: 'hsl(var(--foreground))',
				legendColor: 'hsl(var(--chart-3))',
			},

			{
				id: 'free',
				label: t('free'),
				value: 2,
				color: 'hsl(var(--chart-1))',
				textColor: 'hsl(var(--foreground))',
				legendColor: 'hsl(var(--chart-4))',
			},
			{
				id: 'inStaking',
				label: t('inStaking'),
				value: 0,
				color: 'hsl(var(--chart-1))',
				textColor: 'hsl(var(--foreground))',
				legendColor: 'hsl(var(--chart-5))',
			},
			{
				id: 'lockedLiquidity',
				label: t('lockedLiquidity'),
				value: 3,
				color: 'hsl(var(--chart-1))',
				textColor: 'hsl(var(--foreground))',
				legendColor: 'hsl(var(--chart-6))',
			},
			{
				id: 'foundersTeam',
				label: t('foundersTeam'),
				value: 0,
				color: 'hsl(var(--chart-2))',
				textColor: 'hsl(var(--foreground))',
				legendColor: 'hsl(var(--chart-7))',
			},
			{
				id: 'affilatePool',
				label: t('affilatePool'),
				value: 4,
				color: 'hsl(var(--chart-1))',
				textColor: 'hsl(var(--foreground))',
				legendColor: 'hsl(var(--chart-8))',
			},
			{
				id: 'partnersPool',
				label: t('partnersPool'),
				value: 5,
				color: 'hsl(var(--chart-2))',
				textColor: 'hsl(var(--foreground))',
				legendColor: 'hsl(var(--chart-9))',
			},
		],
		[],
	);

	const mapedValues = useMemo(() => {
		return data.map((item, index) => {
			return { ...item, value: currentDistribution[index] || index };
		});
	}, [currentDistribution.length]);
	// Calculate total value for percentage calculation
	const totalValue = mapedValues.reduce((sum, item) => sum + item.value, 0);
	// Define theme for custom font size
	const theme = {
		labels: {
			text: {
				fontSize: 10,
				fill: 'hsl(var(--foreground))',
			},
		},
	};

	if (!isTabletOrMobile) {
		return (
			<div
				className={cn(' border border-border rounded-md p-6 ', {
					'blur pointer-events-none': isLoading,
				})}
			>
				<div className="px-1">{t('currentDistribution')}</div>
				<div className="aspect-square ">
					<ResponsivePie
						data={mapedValues}
						margin={{ right: 90, left: 90 }}
						activeOuterRadiusOffset={4}
						borderWidth={2}
						colors={{ datum: 'data.color' }}
						arcLinkLabel={(d) => `${d.label}`}
						arcLinkLabelsSkipAngle={10}
						arcLinkLabelsTextColor="hsl(var(--foreground))"
						arcLinkLabelsThickness={2}
						arcLinkLabelsColor={{ from: 'color' }}
						arcLabelsSkipAngle={10}
						arcLinkLabelsStraightLength={2}
						arcLinkLabelsDiagonalLength={8}
						innerRadius={0.4}
						arcLabelsTextColor={{
							from: 'color',
							modifiers: [['darker', 2]],
						}}
						// Show percentage in arc label
						arcLabel={(d) => {
							const percentage = ((d.value / totalValue) * 100).toFixed(1); // Calculate percentage
							return ''; //`${percentage}%`; // Return percentage
						}}
						// Set custom tooltip
						tooltip={Tooltip}
						theme={theme}
					/>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(' border border-border rounded-md p-6 ', {
				'blur pointer-events-none': isLoading,
			})}
		>
			<div className="px-1">{t('currentDistribution')}</div>
			<div className="aspect-square ">
				<ResponsivePie
					margin={{ right: 20, left: 20 }}
					data={mapedValues}
					activeOuterRadiusOffset={4}
					borderWidth={2}
					colors={{ datum: 'data.legendColor' }}
					innerRadius={0.4}
					enableArcLinkLabels={false}
					enableArcLabels={false}
					tooltip={Tooltip}
					theme={theme}
				/>
			</div>
			<div className="mt-6">
				{mapedValues.map((legend, index) => {
					const percentage = ((legend.value / totalValue) * 100).toFixed(1); // Calculate percentage
					return (
						<div key={index} className="flex gap-2 items-center">
							<span className="flex w-4 h-4 rounded-sm" style={{ backgroundColor: legend.legendColor }} />
							<span className="w-11 font-light pr-2"> {`${percentage}%`}</span>
							<span> {legend.label}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

const Tooltip = ({ datum }: PieTooltipProps<IDataPoint>) => {
	return (
		<div className="flex items-center p-2 bg-card border-border border rounded-md">
			{/* Color indicator square */}
			<div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: datum.color }} />
			{/* Label and value display */}
			<div className="text-sm font-medium flex items-center gap-2">
				<span className="">{datum.label || datum.id}:</span> {millify(datum.value)}
				<Bet className={'w-3 h-3 text-accent-secondary-foreground'} />
			</div>
		</div>
	);
};
