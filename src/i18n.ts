import { sharedLang } from 'betfinio_app/locales/index';
import type { i18n } from 'i18next';
import * as i18 from 'i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import czStaking from './translations/cz/staking.json';
import enStaking from './translations/en/staking.json';
import ruStaking from './translations/ru/staking.json';

export const defaultNS = 'staking';
export const resources = {
	en: {
		staking: enStaking,
		shared: sharedLang.en,
	},
	ru: {
		staking: ruStaking,
		shared: sharedLang.ru,
	},
	cs: {
		staking: czStaking,
		shared: sharedLang.cz,
	},
} as const;

const instance: i18n = i18.createInstance();
instance
	.use(initReactI18next)
	.use(I18nextBrowserLanguageDetector)
	.use(ICU)
	.init({
		resources,
		detection: {
			order: ['localStorage', 'navigator'],
			convertDetectedLanguage: (lng) => lng.split('-')[0],
		},
		supportedLngs: ['en', 'ru', 'cs'],
		fallbackLng: 'en',
		defaultNS,
		interpolation: { escapeValue: false },
		react: { useSuspense: true },
	});

export default instance;
