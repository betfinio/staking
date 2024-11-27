import Analytics from '@/src/components/shared/Analytics.tsx';
import Switcher from '@/src/components/shared/Switcher';
import type { StakingType } from '@/src/lib/types.ts';
import { Button } from '@betfinio/components/ui';
import { useChatbot } from 'betfinio_app/chatbot';
import { CircleAlert, CircleHelp } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
const LINK_HOW_TO_STAKE =
	'https://betfin.gitbook.io/betfin-public/v/staking-manual/staking-user-manual/conservative-staking-manual/example-of-conservative-staking';

export interface HeaderProps {
	type: StakingType;
}

const Header: FC<HeaderProps> = ({ type }) => {
	const { t } = useTranslation('staking', { keyPrefix: 'help' });
	const { toggle } = useChatbot();
	return (
		<div className={'h-[80px] border border-border bg-card rounded-lg p-4 sm:px-6 flex flex-row items-center justify-between gap-2 xl:gap-8 relative'}>
			<Switcher type={type} />
			<Analytics type={type} />
			<div className={'flex flex-row items-center gap-4'}>
				<Button variant={'link'} className={'text-foreground md:hover:text-secondary-foreground md:text-secondary-foreground !p-0'} asChild>
					<a target={'_blank'} href={LINK_HOW_TO_STAKE} className={'flex flex-col  items-center justify-center cursor-pointer'} rel="noreferrer">
						<CircleHelp className={'w-6'} />
						<span className={'hidden lg:inline text-xs whitespace-nowrap'}>{t('howToStake')}</span>
					</a>
				</Button>
				<Button
					onClick={toggle}
					variant={'link'}
					className={'text-foreground md:hover:text-secondary-foreground md:text-secondary-foreground flex flex-col items-center justify-center p-0'}
				>
					<CircleAlert className={'w-6'} />
					<span className={'hidden lg:inline text-xs whitespace-nowrap'}>{t('report')}</span>
				</Button>
			</div>
		</div>
	);
};

export default Header;
