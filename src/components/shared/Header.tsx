import Analytics from '@/src/components/shared/Analytics.tsx';
import Switcher from '@/src/components/shared/Switcher';
import type {StakingType} from '@/src/lib/types.ts';
import {Button} from 'betfinio_app/button';
import {CircleAlert, CircleHelp} from 'lucide-react';
import type {FC} from 'react';

const LINK_HOW_TO_STAKE =
	'https://betfin.gitbook.io/betfin-public/v/staking-manual/staking-user-manual/conservative-staking-manual/example-of-conservative-staking';

export interface HeaderProps {
	type: StakingType;
}

const Header: FC<HeaderProps> = ({type}) => {
	const handleReport = () => {
		document.getElementById('live-chat-ai-button')?.click();
	}
	return (
		<div
			className={
				'h-[80px] border border-gray-800 bg-primaryLighter rounded-lg p-4 sm:px-6 flex flex-row items-center justify-between gap-2 xl:gap-8 relative'
			}
		>
			<Switcher type={type}/>
			<Analytics type={type}/>
			<div className={'flex flex-row items-center gap-4'}>
				<Button
					variant={'link'}
					className={
						'text-white md:hover:text-yellow-400 md:text-yellow-400 !p-0'
					}
					asChild
				>
					<a
						target={'_blank'}
						href={LINK_HOW_TO_STAKE}
						className={
							'flex flex-col  items-center justify-center cursor-pointer'
						}
						rel="noreferrer"
					>
						<CircleHelp className={'w-6'}/>
						<span className={'hidden lg:inline text-xs whitespace-nowrap'}>
              How to stake
            </span>
					</a>
				</Button>
				<Button
					onClick={handleReport}
					variant={'link'}
					className={
						'text-white md:hover:text-yellow-400 md:text-yellow-400 flex flex-col items-center justify-center p-0'
					}
				>
					<CircleAlert className={'w-6'}/>
					<span className={'hidden lg:inline text-xs whitespace-nowrap'}>
            Report
          </span>
				</Button>
			</div>
		</div>
	);
};

export default Header;
