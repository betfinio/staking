import type { StakingType } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { Bank, Menu, MoneyHand } from '@betfinio/components/icons';
import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from '@betfinio/components/ui';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const Switcher: FC<{ type: StakingType }> = ({ type }) => {
	const { t } = useTranslation('staking');
	return (
		<Dialog>
			<DialogTrigger>
				<motion.div className={'flex flex-row items-center  gap-2 sm:gap-4 cursor-pointer'} whileHover={{ scale: 1.03 }}>
					<Menu className={'text-foreground'} />
					{type === 'conservative' ? <Bank className={'text-secondary-foreground'} /> : <MoneyHand className={'text-secondary-foreground w-9 h-9'} />}
					<div className={'flex flex-col leading-none items-start'}>
						<div className={'font-semibold text-sm lg:text-lg whitespace-nowrap'}>{t(`title.${type}`)}</div>
						<div className={'text-xs text-tertiary-foreground '}>{t(`subtitle.${type}`)}</div>
					</div>
				</motion.div>
			</DialogTrigger>
			<DialogPortal>
				<DialogOverlay />
				<DialogContent className={'p-2 '}>
					<DialogDescription className={'hidden'} />
					<DialogTitle className={'hidden'} />
					<SwitcherModal type={type} />
				</DialogContent>
			</DialogPortal>
		</Dialog>
	);
};

export default Switcher;

const SwitcherModal: FC<{ type: StakingType }> = ({ type }) => {
	const { t } = useTranslation('staking');
	return (
		<>
			<div className={'flex flex-col p-3 gap-3 '}>
				<motion.div whileHover={{ scale: 1.03 }}>
					<Link
						to={'/conservative'}
						className={cn(
							'flex flex-row items-center gap-4 border border-border rounded-lg p-4 ',
							type === 'conservative' ? 'text-secondary-foreground' : 'text-foreground',
						)}
					>
						<Bank className={'w-10 h-10'} />
						<div className={'flex flex-col leading-none'}>
							<span className={'font-semibold whitespace-nowrap'}>{t('title.conservative')}</span>
						</div>
					</Link>
				</motion.div>
				<motion.div whileHover={{ scale: 1.03 }}>
					<Link
						to={'/dynamic'}
						className={cn(
							'flex flex-row items-center gap-4  border border-border rounded-lg p-4',
							type === 'dynamic' ? 'text-secondary-foreground' : 'text-foreground',
						)}
					>
						<MoneyHand className={'w-10 h-10'} />
						<div className={'flex flex-col leading-none'}>
							<span className={'font-semibold'}>{t('title.dynamic')}</span>
						</div>
					</Link>
				</motion.div>
			</div>
		</>
	);
};
