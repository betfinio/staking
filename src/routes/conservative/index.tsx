import Header from '@/src/components/shared/Header'
import {createFileRoute} from '@tanstack/react-router'
import Stake from "@/src/components/shared/Stake";
import Claim from "@/src/components/conservative/Claim";
import InfoBlock from "@/src/components/shared/InfoBlock";

export const Route = createFileRoute('/conservative/')({
	component: ConservativeStakingPage
})


function ConservativeStakingPage() {
	return <div className={'w-full h-full p-2 md:p-3 lg:p-4 gap-2 flex flex-col lg:gap-4'}>
		<Header type={'conservative'}/>
		<div className={'grid w-full grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-2 lg:gap-4'}>
			<div className={'flex flex-col gap-2 lg:gap-4 w-full justify-between'}>
				<Stake type={'conservative'}/>
				<Claim className={'hidden lg:flex'}/>
			</div>
			<InfoBlock type={'conservative'}/>
		</div>
	</div>
}