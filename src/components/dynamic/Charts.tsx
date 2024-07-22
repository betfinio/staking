import Chart from '@/src/components/shared/Chart';
import {
  useTotalProfitStat,
  useTotalStakedStat,
  useTotalStakersStat,
} from 'betfinio_app/lib/query/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'betfinio_app/tabs';
import { DateTime } from 'luxon';

const Charts = () => {
  const { data: totalStaked = [], error } = useTotalStakedStat();
  const { data: totalStakers = [] } = useTotalStakersStat();
  const { data: totalProfit = [] } = useTotalProfitStat();
  return (
    <div className={'flex flex-col h-full'}>
      <Tabs defaultValue="staked" className={'grow flex flex-col'}>
        <TabsList className={'flex flex-row gap-2 text-sm'}>
          <TabsTrigger value={'staked'}>Staked</TabsTrigger>
          <TabsTrigger value={'stakers'}>Stakers</TabsTrigger>
          <TabsTrigger value={'revenues'}>Revenues</TabsTrigger>
        </TabsList>

        <TabsContent value={'staked'} className={'grow'}>
          <Chart
            label="Total staked"
            className={'h-full'}
            color={'#facc15'}
            values={totalStaked.map((e) => e.value)}
            labels={totalStaked.map((e) =>
              DateTime.fromMillis(e.time * 1000).toFormat('dd.MM'),
            )}
          />
        </TabsContent>
        <TabsContent value={'stakers'} className={'grow'}>
          <Chart
            label={'Total stakers'}
            color={'#6A6A9F'}
            values={totalStakers.map((e) => e.value)}
            labels={totalStakers.map((e) =>
              DateTime.fromMillis(e.time * 1000).toFormat('dd.MM'),
            )}
          />
        </TabsContent>
        <TabsContent value={'revenues'} className={'grow'}>
          <Chart
            label={'Total revenue'}
            values={totalProfit.map((e) => e.value)}
            labels={totalProfit.map((e) =>
              DateTime.fromMillis(e.time * 1000).toFormat('dd.MM'),
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default Charts;
