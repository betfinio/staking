import { sharedLang } from 'betfinio_app/locales/index';
import type { i18n } from 'i18next';
import * as i18 from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import czStaking from './translations/cz/staking.json';
import enStaking from './translations/en/staking.json';
import ruStaking from './translations/ru/staking.json';

export const defaultNS = 'staking';
export const defaultLocale = 'en';

export const resources = {
	en: {
		staking: enStaking,
		shared: sharedLang.en,
	},
	ru: {
		staking: ruStaking,
		shared: sharedLang.ru,
	},
	cz: {
		staking: czStaking,
		shared: sharedLang.cz,
	},
	cs: {
		games: czStaking,
		shared: sharedLang.cz,
	},
} as const;

const instance: i18n = i18.createInstance();
instance
	.use(initReactI18next)
	.use(ICU)
	.init({
		resources,
		fallbackLng: 'en',
		defaultNS,
		interpolation: { escapeValue: false },
		react: { useSuspense: true },
	});

const changeLanguage = async (locale: string | null) => {
	const lng = locale ?? defaultLocale;
	await instance.changeLanguage(lng);
	localStorage.setItem('i18nextLng', lng);
};

if (!localStorage.getItem('i18nextLng')) {
	const locale = navigator.language.split('-')[0];
	changeLanguage(locale);
} else {
	changeLanguage(localStorage.getItem('i18nextLng'));
}

export default instance;
