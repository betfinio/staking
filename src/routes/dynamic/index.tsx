import Header from '@/src/components/shared/Header'
import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/dynamic/')({
	component: DynamicStakingPage
})


function DynamicStakingPage() {
	return <div className={'border border-red-500 w-full h-full p-2 md:p-3 lg:p-4'}>
		<Header type={'dynamic'}/>
	</div>
}