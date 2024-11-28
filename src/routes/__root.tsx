import { VersionValidation } from '@/src/components/shared/VersionValidation.tsx';
import instance from '@/src/i18n.ts';
import { Toaster } from '@betfinio/components/ui';
import { createRootRoute } from '@tanstack/react-router';
import { Root } from 'betfinio_app/root';

export const Route = createRootRoute({
	component: () => (
		<Root id={'staking'} instance={instance}>
			<Toaster />
			<VersionValidation repository={'app'} branch={import.meta.env.PUBLIC_BRANCH} current={import.meta.env.PUBLIC_DEPLOYED} />
		</Root>
	),
});
