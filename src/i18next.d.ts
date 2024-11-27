import type { resources } from './i18n';

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'staking';
		resources: (typeof resources)['en'];
	}
}

export type IKeysOfErrors = keyof typeof resources.cs.shared.errors;
