import * as i18 from 'i18next';
import type { i18n } from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import czJSON from './translations/cz.json';
import enJSON from './translations/en.json';
import ruJSON from './translations/ru.json';
export const defaultNS = 'staking';
// @ts-ignore
import czShared from 'betfinio_app/locales/cz';
// @ts-ignore
import enShared from 'betfinio_app/locales/en';
// @ts-ignore
import ruShared from 'betfinio_app/locales/ru';

import type { SharedLangs } from 'betfinio_app/locales/index';

export const resources = {
	en: {
		staking: enJSON,
		shared: enShared as SharedLangs['en'],
	},
	ru: {
		staking: ruJSON,
		shared: ruShared as SharedLangs['ru'],
	},
	cz: {
		staking: czJSON,
		shared: czShared as SharedLangs['cz'],
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
