export interface AppSettings {
  contentLanguageId: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  contentLanguageId: 'sr-lat' // По умолчанию sr-lat код
}

const STORAGE_KEY = 'app-settings'

export const useAppSettings = () => {
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })
  const { getCachedActiveLanguages } = useCacheManager()

  // Кеш для языков
  const languagesCache = ref<any[]>([])

  // Загрузка языков из кэша
  const loadLanguages = async () => {
    if (languagesCache.value.length === 0) {
      try {
        console.log('Loading languages from cache...')
        languagesCache.value = await getCachedActiveLanguages()
        console.log('Loaded languages:', languagesCache.value)
      } catch (error) {
        console.error('Failed to load languages:', error)
        languagesCache.value = []
      }
    }
    return languagesCache.value
  }

  // Получение ID языка по коду
  const getLanguageIdByCode = async (code: string): Promise<string> => {
    console.log('Converting language code to ID:', code)
    const languages = await loadLanguages()
    const language = languages.find(lang => lang.code === code)
    const result = language?.id || code
    console.log('Language conversion result:', { code, id: result, language })
    return result
  }

  // Получение кода языка по ID
  const getLanguageCodeById = async (id: string): Promise<string> => {
    const languages = await loadLanguages()
    const language = languages.find(lang => lang.id === id)
    return language?.code || id // Возвращаем ID, если код не найден
  }

  // Загрузка настроек из localStorage
  const loadSettings = (): AppSettings => {
    if (process.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as AppSettings
          console.log('Loaded settings from localStorage:', parsed)
          return { ...DEFAULT_SETTINGS, ...parsed }
        }
      } catch (error) {
        console.warn('Failed to load app settings:', error)
      }
    }
    console.log('Using default settings:', DEFAULT_SETTINGS)
    return { ...DEFAULT_SETTINGS }
  }

  // Сохранение настроек в localStorage
  const saveSettings = (newSettings: AppSettings) => {
    if (process.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
        settings.value = { ...newSettings }
        console.log('Saved settings to localStorage:', newSettings)
      } catch (error) {
        console.error('Failed to save app settings:', error)
      }
    }
  }

  // Обновление языка контента по коду
  const setContentLanguageByCode = async (languageCode: string) => {
    const languageId = await getLanguageIdByCode(languageCode)
    const newSettings = {
      ...settings.value,
      contentLanguageId: languageId
    }
    saveSettings(newSettings)
  }

  // Обновление языка контента по ID
  const setContentLanguage = (languageId: string) => {
    const newSettings = {
      ...settings.value,
      contentLanguageId: languageId
    }
    saveSettings(newSettings)
  }

  // Инициализация настроек
  const initSettings = async () => {
    console.log('Initializing app settings...')
    const loadedSettings = loadSettings()
    
    // Если сохраненное значение выглядит как код (содержит дефис), конвертируем в ID
    if (loadedSettings.contentLanguageId.includes('-')) {
      console.log('Converting language code to ID:', loadedSettings.contentLanguageId)
      const languageId = await getLanguageIdByCode(loadedSettings.contentLanguageId)
      loadedSettings.contentLanguageId = languageId
      saveSettings(loadedSettings)
      console.log('Settings updated with language ID:', languageId)
    }
    
    settings.value = loadedSettings
    console.log('App settings initialized:', settings.value)
  }

  // Computed свойства
  const contentLanguageId = computed<string>({
    get: () => settings.value.contentLanguageId,
    set: (value) => setContentLanguage(value)
  })

  // Получение кода текущего языка
  const contentLanguageCode = computed<string>(() => {
    const languages = languagesCache.value
    const language = languages.find(lang => lang.id === settings.value.contentLanguageId)
    return language?.code || 'sr-lat'
  })

  return {
    settings: readonly(settings),
    contentLanguageId,
    contentLanguageCode,
    setContentLanguage,
    setContentLanguageByCode,
    initSettings,
    saveSettings,
    loadSettings,
    getLanguageIdByCode,
    getLanguageCodeById,
    loadLanguages
  }
} 