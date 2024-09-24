import EarningsTable from '@/src/components/dynamic/tables/EarningsTable.tsx';
import PoolsTable from '@/src/components/dynamic/tables/PoolsTable.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'betfinio_app/tabs';
import { useTranslation } from 'react-i18next';
import StakesTable from './tables/Stakes/StakesTable';

const Tables = () => {
	const { t } = useTranslation('staking', { keyPrefix: 'table' });

	return (
		<Tabs defaultValue="stakes">
			<TabsList>
				<TabsTrigger value="pools">{t('tabs.pools')}</TabsTrigger>
				<TabsTrigger value="stakes">{t('tabs.staking')}</TabsTrigger>
				<TabsTrigger value="earnings">{t('tabs.earnings')}</TabsTrigger>
				{/*<TabsTrigger value='unstakes'>{t('tabs.unstakes')}</TabsTrigger>*/}
			</TabsList>
			<TabsContent value="stakes">
				<StakesTable />
			</TabsContent>
			<TabsContent value="earnings">
				<EarningsTable />
			</TabsContent>
			<TabsContent value="pools">
				<PoolsTable />
			</TabsContent>
		</Tabs>
	);
};

export default Tables;
