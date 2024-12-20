import Charts from '@/src/components/conservative/Charts.tsx';
import Claim from '@/src/components/conservative/Claim';
import { CycleOverview } from '@/src/components/conservative/CycleOverview.tsx';
import Tables from '@/src/components/conservative/Tables.tsx';
import Header from '@/src/components/shared/Header';
import InfoBlock from '@/src/components/shared/InfoBlock';
import Stake from '@/src/components/shared/Stake';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/conservative/')({
	component: ConservativeStakingPage,
});

function ConservativeStakingPage() {
	const { t } = useTranslation('shared', { keyPrefix: 'errors' });
	return (
		<div className={'w-full h-full p-2 md:p-3 lg:p-4 gap-2 flex flex-col lg:gap-4'}>
			<Header type={'conservative'} />
			<div className={'grid w-full grid-cols-2 gap-y-2 md:gap-2 lg:gap-4'}>
				<div className={'flex flex-col gap-2 lg:gap-4 w-full justify-between col-span-2 md:col-span-1'}>
					<Stake type={'conservative'} />
					<Claim className={'flex'} />
				</div>
				<InfoBlock type={'conservative'} />
				<Charts />
				<CycleOverview />
			</div>
			<Tables />
		</div>
	);
}
