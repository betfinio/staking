import { VersionValidation } from '@/src/components/shared/VersionValidation.tsx';
import instance from '@/src/i18n.ts';
import { Toaster } from '@betfinio/components/ui';
import { createRootRoute } from '@tanstack/react-router';
import { Root } from 'betfinio_app/root';
import { PUBLIC_BRANCH, PUBLIC_DEPLOYED } from '../globals';

export const Route = createRootRoute({
	component: () => (
		<Root id={'staking'} instance={instance}>
			<Toaster />
			<VersionValidation repository={'staking'} branch={PUBLIC_BRANCH} current={PUBLIC_DEPLOYED} />
		</Root>
	),
});
