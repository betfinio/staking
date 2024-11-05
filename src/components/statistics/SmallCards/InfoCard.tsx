import { Bet } from '@betfinio/ui/dist/icons';
import { BetValue } from 'betfinio_app/BetValue';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'betfinio_app/tooltip';
import cx from 'clsx';
import { motion } from 'framer-motion';
import { UserIcon } from 'lucide-react';
import milify from 'millify';
import type { FC } from 'react';

interface IInfoCardProps {
	header: string;
	title: string | number;
	subtitle?: string;
	tooltipContent: string[];
	titleType?: 'currency' | 'user';
}
export const InfoCard: FC<IInfoCardProps> = ({ header, title, subtitle, tooltipContent, titleType }) => {
	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<motion.div className="relative border border-border py-3 flex flex-col  gap-2 h-full items-center bg-card rounded-lg">
					<p>{header}</p>
					<div
						className={cx(
							' flex-grow text-base lg:text-lg font-semibold text-center flex flex-wrap items-center justify-center gap-1 text-accent-secondary-foreground',
						)}
					>
						{!titleType && <span>{title}</span>}
						{titleType === 'currency' && <BetValue value={title} withIcon />}
						{titleType === 'user' && (
							<>
								{title}
								<UserIcon className={'w-4 h-4'} />
							</>
						)}
					</div>

					{subtitle && <p className={'text-xs text-tertiary-foreground'}>{subtitle}</p>}
					<span
						className={
							'absolute right-4 top-2 border-2 text-tertiary-foreground border-current font-semibold text-xs w-[18px] h-[18px] flex items-center justify-center rounded-full'
						}
					>
						<TooltipTrigger>?</TooltipTrigger>
					</span>
				</motion.div>
				<TooltipContent>
					<div className={'p-4 text-xs max-w-[90vw] leading-5 '}>
						{tooltipContent.map((content, index) => (
							<p key={index}>{content}</p>
						))}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
