import { valueToNumber } from '@betfinio/abi';
import { truncateEthAddress } from '@betfinio/hooks/dist/utils';
import { Bet } from '@betfinio/ui/dist/icons';
import { Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { BetValue } from 'betfinio_app/BetValue';
import { DataTable } from 'betfinio_app/DataTable';
import type { Stake } from 'betfinio_app/lib/types';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from 'betfinio_app/tooltip';
import { DateTime } from 'luxon';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<Stake>();

const Stakes: FC<{ data: Stake[]; isLoading: boolean }> = ({
	data,
	isLoading,
}) => {
	const { t } = useTranslation('', { keyPrefix: 'staking' });
	const columns = [
		columnHelper.accessor('start', {
			header: t('table.date'),
			meta: {
				className: 'hidden md:table-cell ',
			},
			cell: (props) => (
				<span className={'text-gray-400'}>
					{DateTime.fromMillis(props.getValue() * 1000).toFormat('DD, T')}
				</span>
			),
		}),
		columnHelper.accessor('end', {
			header: t('table.unlockDate'),
			cell: (props) => (
				<span className={'text-gray-400 text-xs md:text-sm'}>
					{DateTime.fromMillis(props.getValue() * 1000).toFormat('DD, T')}
				</span>
			),
		}),
		columnHelper.accessor('pool', {
			header: t('table.pool'),
			meta: {
				className: 'hidden md:table-cell',
			},
			cell: (props) => (
				<a
					target={'_blank'}
					href={import.meta.env.PUBLIC_ETHSCAN + '/address/' + props.getValue()}
					rel="noreferrer"
				>
					{truncateEthAddress(props.getValue())}
				</a>
			),
		}),
		columnHelper.accessor('amount', {
			header: t('table.amount'),
			cell: (props) => (
				<div className={'flex gap-1 items-center'}>
					<BetValue
						className={
							'font-semibold text-yellow-400 text-xs md:text-sm flex flex-row items-center gap-1'
						}
						withIcon
						precision={2}
						value={valueToNumber(props.getValue())}
					/>
				</div>
			),
		}),
		columnHelper.accessor('ended', {
			header: t('table.status'),
			meta: {
				className: 'hidden md:table-cell ',
			},
			cell: (props) => (
				<span>{props.getValue() === true ? 'Ended' : 'Active'}</span>
			),
		}),
		columnHelper.accessor('reward', {
			header: t('table.reward'),
			cell: (props) => <RewardValue {...props} />,
		}),
	];

	// @ts-ignore
	return <DataTable columns={columns} data={data} isLoading={isLoading} />;
};

// todo add ts
const RewardValue = (props: any) => {
	const poolReward = Number(props.getValue() ?? 1n);
	const poolAmount = Number(props.row.getValue('amount') as bigint);
	const percentage = (poolReward / poolAmount) * 100;
	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<div className={'text-green-400 font-bold'}>
					<TooltipTrigger>
						<span>{percentage.toFixed(2)}%</span>
					</TooltipTrigger>
				</div>
				<TooltipContent className={'text-white bg-black'}>
					Claimed rewards:
					<div
						className={
							'text-yellow-400 font-bold flex items-center gap-1 justify-center'
						}
					>
						{Math.floor(valueToNumber(props.getValue())).toLocaleString()}{' '}
						<Bet />
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export default Stakes;
