import type { NuxtI18nOptions, LocaleObject } from '@nuxtjs/i18n';
export interface Language {
    code: string;
    name: string;
    localName: string;
    flag?: string;
    direction?: 'ltr' | 'rtl';
}

export const availableLanguages: Language[] = [
    {
        code: 'en',
        name: 'ENG',
        localName: 'English',
        flag: '🇺🇸',
        direction: 'ltr',
    },
    {
        code: 'ru',
        name: 'RUS',
        localName: 'Русский',
        flag: '🇷🇺',
        direction: 'ltr',
    },
    {
        code: 'sr',
        name: 'SRB',
        localName: 'Srpski',
        flag: '🇷🇸',
        direction: 'ltr',
    },
];

export const defaultLocale = 'en';

export const i18nConfig: Partial<NuxtI18nOptions> = {
    langDir: 'locales',
    defaultLocale,
    locales: availableLanguages.map((lang) => ({
        code: lang.code,
        name: lang.localName,
        file: `${lang.code}.json`,
        dir: lang.direction,
    })) as LocaleObject[],
    strategy: 'no_prefix',
    lazy: false,
    detectBrowserLanguage: {
        useCookie: true,
        cookieKey: 'i18n_lang',
        redirectOn: 'root' as const,
    },
};
