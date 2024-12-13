import Charts from '@/src/components/dynamic/Charts.tsx';
import { CycleOverview } from '@/src/components/dynamic/DynamicCycleOverview.tsx';
import Tables from '@/src/components/dynamic/Tables.tsx';
import Header from '@/src/components/shared/Header';
import InfoBlock from '@/src/components/shared/InfoBlock.tsx';
import Stake from '@/src/components/shared/Stake.tsx';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dynamic/')({
	component: DynamicStakingPage,
});

function DynamicStakingPage() {
	return (
		<div className={'w-full h-full p-2 md:p-3 lg:p-4 gap-2 flex flex-col lg:gap-4'}>
			<Header type={'dynamic'} />

			{/* <div className={'grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-4'}>
				<div className={'row-span-2'}>
					<Stake type={'dynamic'} />
				</div>
				<div className={'flex flex-col justify-between gap-2 lg:gap-4 row-span-3'}>
					<InfoBlock type={'dynamic'} />
				</div>
				<div className={'row-span-3 mt-4 mb-1 md:mb-0 md:mt-2 lg:mt-0'}>
					<Charts />
				</div>
				<div className={'row-span-2 mt-2 lg:mt-1'}>
					<CycleOverview />
				</div>
			</div> */}

			<div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-x-2 lg:gap-x-4">
				<div className="col-span-1 flex flex-col gap-y-4">
					<Stake type={'dynamic'} />
					<Charts />
				</div>
				<div className="col-span-1 flex flex-col gap-4">
					<InfoBlock type={'dynamic'} />
					<CycleOverview />
				</div>
			</div>
			<div className="md:hidden flex flex-col gap-2">
				<Stake type={'dynamic'} />

				<InfoBlock type={'dynamic'} />
				<Charts />
				<CycleOverview />
			</div>
			<Tables />
		</div>
	);
}
