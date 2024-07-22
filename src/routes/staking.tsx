import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/staking')({
  beforeLoad: () => {
    throw redirect({ to: '/conservative', replace: true });
  },
});
