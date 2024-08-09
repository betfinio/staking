import Revenues from '@/src/components/statistics/Revenues';
import Staked from '@/src/components/statistics/Staked';
import Stakers from '@/src/components/statistics/Stakers';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/statistics/')({
  component: StatisticsPage,
});

function StatisticsPage() {
  return (
    <div className={'p-2 md:p-3 lg:p-4 flex flex-col gap-2 md:gap-3 lg:gap-4'}>
      <div
        className={'grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 lg:gap-4'}
      >
        <Staked />
        <Stakers />
      </div>
      <div className={'grid grid-cols-1 gap-2 md:gap-3 lg:gap-4'}>
        <Revenues />
      </div>
    </div>
  );
}
