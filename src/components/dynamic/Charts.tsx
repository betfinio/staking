import Chart from '@/src/components/shared/Chart';
import {
	useTotalProfitStat,
	useTotalStakedStat,
	useTotalStakersStat,
} from 'betfinio_app/lib/query/dynamic';
import {Tabs, TabsContent, TabsList, TabsTrigger} from 'betfinio_app/tabs';
import {DateTime} from 'luxon';
import {Select, SelectItem, SelectContent, SelectTrigger, SelectValue} from "betfinio_app/select";
import {useState} from "react";

import {Timeframe} from 'betfinio_app/lib/types';

const Charts = () => {
	const [timeframe, setTimeframe] = useState<Timeframe>('day');
	const {data: totalStaked = [], error} = useTotalStakedStat(timeframe);
	const {data: totalStakers = []} = useTotalStakersStat(timeframe);
	const {data: totalProfit = []} = useTotalProfitStat(timeframe);
	const handleChange = (val: any) => {
		setTimeframe(val);
	}
	return (
		<div className={'flex flex-col h-full'}>
			<Tabs defaultValue="staked" className={'grow flex flex-col'}>
				<TabsList className={'flex flex-row gap-2 text-sm'}>
					<TabsTrigger value={'staked'}>Staked</TabsTrigger>
					<TabsTrigger value={'stakers'}>Stakers</TabsTrigger>
					<TabsTrigger value={'revenues'}>Revenues</TabsTrigger>
					<div className={'flex-grow flex justify-end'}>
						<Select defaultValue={'day'} onValueChange={handleChange}>
							<SelectTrigger className={'max-w-[100px]'}>
								<SelectValue placeholder="Timeframe"/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="hour">1 hour</SelectItem>
								<SelectItem value="day">1 day</SelectItem>
								<SelectItem value="week">1 week</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</TabsList>
				
				<TabsContent value={'staked'} className={'grow'}>
					<Chart
						label="Total staked"
						className={'h-full'}
						color={'#facc15'}
						values={totalStaked.map((e) => e.value)}
						labels={totalStaked.map((e) =>
							DateTime.fromMillis(e.time * 1000).toFormat(timeframe === 'hour' ? 'HH:mm' : 'dd.MM'),
						)}
					/>
				</TabsContent>
				<TabsContent value={'stakers'} className={'grow'}>
					<Chart
						label={'Total stakers'}
						color={'#6A6A9F'}
						values={totalStakers.map((e) => e.value)}
						labels={totalStakers.map((e) =>
							DateTime.fromMillis(e.time * 1000).toFormat(timeframe === 'hour' ? 'HH:mm' : 'dd.MM'),
						)}
					/>
				</TabsContent>
				<TabsContent value={'revenues'} className={'grow'}>
					<Chart
						label={'Total revenue'}
						values={totalProfit.map((e) => e.value)}
						labels={totalProfit.map((e) =>
							DateTime.fromMillis(e.time * 1000).toFormat(timeframe === 'hour' ? 'HH:mm' : 'dd.MM'),
						)}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
};
export default Charts;
