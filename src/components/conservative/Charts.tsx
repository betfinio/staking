import {DateTime} from "luxon";
import {useTotalProfitStat, useTotalStakedStat, useTotalStakersStat} from "betfinio_app/lib/query/conservative";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "betfinio_app/tabs";
import Chart from "@/src/components/shared/Chart";

const Charts = () => {
	const {data: totalStaked = [], error} = useTotalStakedStat()
	const {data: totalStakers = []} = useTotalStakersStat()
	const {data: totalProfit = []} = useTotalProfitStat()
	return <div className={'flex flex-col col-span-2 md:col-span-1'}>
		<Tabs defaultValue="staked">
			<TabsList className={'flex flex-row gap-2 text-sm'}>
				<TabsTrigger value={'staked'}>Staked</TabsTrigger>
				<TabsTrigger value={'stakers'}>Stakers</TabsTrigger>
				<TabsTrigger value={'revenues'}>Revenues</TabsTrigger>
			</TabsList>
			
			<TabsContent value={'staked'} className={'h-full'}>
				<Chart label='Total staked' color={'#facc15'} values={totalStaked.map(e => e.value)}
				       labels={totalStaked.map(e => DateTime.fromMillis(e.time * 1000).toFormat('dd.MM'))}/>
			</TabsContent>
			<TabsContent value={'stakers'} className={'h-full'}>
				<Chart label={'Total stakers'} color={'#6A6A9F'} values={totalStakers.map(e => e.value)}
				       labels={totalStakers.map(e => DateTime.fromMillis(e.time * 1000).toFormat('dd.MM'))}/>
			</TabsContent>
			<TabsContent value={'revenues'} className={'h-full'}>
				<Chart label={'Total revenue'} values={totalProfit.map(e => e.value)}
				       labels={totalProfit.map(e => DateTime.fromMillis(e.time * 1000).toFormat('dd.MM'))}/>
			</TabsContent>
		</Tabs>
	</div>
}
export default Charts;