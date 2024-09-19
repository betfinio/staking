import * as i18 from 'i18next';
import type { i18n } from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import czJSON from './translations/cz.json';
import enJSON from './translations/en.json';
import ruJSON from './translations/ru.json';
export const defaultNS = 'staking';

import { sharedLang } from 'betfinio_app/locales/index';

export const resources = {
	en: {
		staking: enJSON,
		shared: sharedLang.en,
	},
	ru: {
		staking: ruJSON,
		shared: sharedLang.ru,
	},
	cz: {
		staking: czJSON,
		shared: sharedLang.cz,
	},
} as const;

const instance: i18n = i18.createInstance();
instance
	.use(initReactI18next)
	.use(ICU)
	.init({
		resources,
		lng: 'en', // default language
		fallbackLng: 'en',

		defaultNS,
		interpolation: { escapeValue: false },
		react: { useSuspense: true },
	});

export default instance;
