import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';

export const Route = createFileRoute('/statistics')({
	component: RouteComponent,
	beforeLoad: () => {
		window.location.href = `${window.location.origin}/statistics`;
	},
});

function RouteComponent() {
	return 'Hello /statistics!';
}
