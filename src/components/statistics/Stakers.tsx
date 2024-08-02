import {ResponsiveLine, SliceTooltipProps} from '@nivo/line'
import {useTotalStakersStat as useTotalStakersStatConservative} from "betfinio_app/lib/query/conservative";
import {useTotalStakersStat as useTotalStakersStatDynamic} from "betfinio_app/lib/query/dynamic";
import {useMemo, useState} from "react";
import {Stat, Timeframe} from "betfinio_app/lib/types";
import {DateTime} from "luxon";
import millify from "millify";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "betfinio_app/select";
import {UserIcon} from "lucide-react";
import cx from "clsx";

const Stakers = () => {
	const [timeframe, setTimeframe] = useState<Timeframe>('day');
	const {data: conservative = []} = useTotalStakersStatConservative(timeframe)
	const {data: dynamic = []} = useTotalStakersStatDynamic(timeframe)
	
	const conservativeData = useMemo(() => {
		return conservative.map((item: Stat) => {
			return {
				x: item.time,
				y: item.value
			}
		})
	}, [conservative])
	
	const dynamicData = useMemo(() => {
		return dynamic.map((item: any) => {
			return {
				x: item.time,
				y: item.value
			}
		})
	}, [dynamic])
	
	const {min, max} = useMemo(() => {
		return {
			min: Math.min(...conservativeData.map(e => e.y), ...dynamicData.map(e => e.y)),
			max: Math.max(...conservativeData.map(e => e.y), ...dynamicData.map(e => e.y))
		}
	}, [conservativeData, dynamicData])
	
	
	const data: any[] = [
		{
			"id": "Conservative",
			"color": "#facc15",
			"data": conservativeData
		},
		{
			"id": "Dynamic",
			"color": "#6A6A9F",
			"data": dynamicData
		}
	]
	
	const handleChange = (val: any) => {
		setTimeframe(val);
	}
	
	return <div className={'border border-gray-800 rounded-lg aspect-video p-2'}>
		<div className={'text-lg flex flex-row justify-between'}>
			<div className={'px-1'}>
				Total Stakers
			</div>
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
		<ResponsiveLine
			data={data}
			margin={{top: 20, right: 30, bottom: 50, left: 50}}
			curve={'monotoneX'}
			colors={{datum: 'color'}}
			enableGridX={false}
			enableGridY={false}
			axisTop={null}
			axisRight={null}
			axisLeft={{
				format: (value) => millify(value, {precision: 2}),
			}}
			axisBottom={{
				format: (value) => DateTime.fromSeconds(value).toFormat(timeframe === 'hour' ? 'HH:mm' : 'dd.MM'),
				tickRotation: 45,
			}}
			yScale={{
				min, max,
				type: 'linear'
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
					onClick: (data) => {
						console.log(data)
					},
					symbolSize: 12,
					symbolShape: 'circle',
					symbolBorderColor: 'rgba(0, 0, 0, .5)',
					effects: [
						{
							on: 'hover',
							style: {
								itemBackground: 'rgba(0, 0, 0, .03)',
								itemOpacity: 1
							}
						}
					]
				}
			]}
		/>
	</div>
}

export default Stakers;


const Tooltip = ({slice}: SliceTooltipProps) => {
	return <div className={'flex flex-col gap-1 bg-primaryLighter rounded-lg text-white px-2 py-1 text-sm '}>
		<div className={'text-xs'}>{DateTime.fromSeconds(Number(slice.points[0].data.x)).toFormat("dd.MM HH:mm")}</div>
		{slice.points.map((point, id) => <div className={'flex flex-row items-center  justify-between gap-3'} key={id}>
			<div className={cx('opacity-50')} style={{color: point.color}}>{point.serieId}</div>
			<div className={'flex flex-row items-center gap-1'}>
				{point.data.y.toLocaleString()} <UserIcon className={'w-4 h-4'}/>
			</div>
		</div>)}
	</div>
}