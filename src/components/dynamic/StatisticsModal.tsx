import SharedGameBlock from '@/src/components/shared/SharedGameBlock.tsx';
import { usePredictContribution } from '@/src/lib/query/conservative';
import { valueToNumber } from '@betfinio/abi';
import { Bank, CloseModal } from '@betfinio/ui/dist/icons';
import { Link } from '@tanstack/react-router';
import { BetValue } from 'betfinio_app/BetValue';
import { DialogClose } from 'betfinio_app/dialog';
import { useTotalProfit } from 'betfinio_app/lib/query/dynamic';
import cx from 'clsx';
import { ShieldCheckIcon } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const DYNAMIC_STAKING_ADDRESS = import.meta.env.PUBLIC_DYNAMIC_STAKING_ADDRESS;

const StatisticsModal: FC = () => {
	const { t } = useTranslation('staking');
	const { data: totalProfit = 0n } = useTotalProfit();
	return (
		<div className={cx('rounded-lg bg-primaryLighter z-10 border border-gray-800 font-semibold text-white w-full mx-auto')}>
			<div className={'py-5 px-7'}>
				<div className={'flex justify-between items-center'}>
					<p className={'text-sm '}>Dynamic staking</p>
					<div>
						<DialogClose>
							<CloseModal className={'cursor-pointer hover:text-[#DD375F] transition-all duration-300'} />
						</DialogClose>
					</div>
				</div>
				<div className={'mt-7 flex items-center justify-center gap-3'}>
					<Bank className={'text-[#FFC800]'} />
					<div className={'text-2xl flex flex-row items-center gap-2'}>
						<BetValue value={valueToNumber(totalProfit)} withIcon />
					</div>
				</div>
				<div className={'h-[2px] opacity-5 bg-white my-6'} />
				<p className={'mb-3 text-center text-sm'}>Games contribution statistics</p>
				<SharedGameBlock
					games={[
						{ amount: 0n, label: t('games.roulette') },
						{ amount: 123n * 10n ** 18n, label: t('games.soon') },
						{ amount: 123n * 10n ** 18n, label: t('games.soon') },
					]}
				/>
				<div className={'h-[2px] opacity-5 bg-white my-6'} />

				<p className={'text-center text-sm mb-4'}>Staking contract</p>
				<div className={'flex items-center justify-center gap-2 '}>
					<ShieldCheckIcon className={'text-[#38BB7F] w-4 h-4'} />
					<a
						href={`${import.meta.env.PUBLIC_ETHSCAN}/address/${DYNAMIC_STAKING_ADDRESS}`}
						target={'_blank'}
						className={'font-normal text-xs md:text-base underline'}
						rel="noreferrer"
					>
						{DYNAMIC_STAKING_ADDRESS}
					</a>
				</div>
			</div>
		</div>
	);
};

export default StatisticsModal;
