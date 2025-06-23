import { availableLanguages } from '~/i18n/i18n';

export const useLanguage = () => {
  const { locale, setLocale } = useI18n();

  const currentLanguage = computed(() => locale.value);
  
  const changeLanguage = async (newLocale: string) => {
    if (availableLanguages.some(lang => lang.code === newLocale)) {
      await setLocale(newLocale as any);
    }
  };

  const getLanguageFlag = (code: string) => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language?.flag || '';
  };

  const getLanguageName = (code: string) => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language?.localName || code;
  };

  return {
    currentLanguage,
    changeLanguage,
    getLanguageFlag,
    getLanguageName,
    availableLanguages
  };
}; 