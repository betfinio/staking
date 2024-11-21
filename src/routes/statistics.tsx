import { createFileRoute } from '@tanstack/react-router';
import { PUBLIC_STATISTICS_MAIN_URL } from '../globals';

export const Route = createFileRoute('/statistics')({
	component: RouteComponent,
	beforeLoad: () => {
		window.location.href = PUBLIC_STATISTICS_MAIN_URL;
	},
});

function RouteComponent() {
	return 'Hello /statistics!';
}
