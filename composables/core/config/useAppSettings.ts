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
        languagesCache.value = await getCachedActiveLanguages()
      } catch (error) {
        languagesCache.value = []
      }
    }
    return languagesCache.value
  }

  // Получение ID языка по коду
  const getLanguageIdByCode = async (code: string): Promise<string> => {
    const languages = await loadLanguages()
    const language = languages.find(lang => lang.code === code)
    const result = language?.id || code
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
          return { ...DEFAULT_SETTINGS, ...parsed }
        }
      } catch (error) {
      }
    }
    return { ...DEFAULT_SETTINGS }
  }

  // Сохранение настроек в localStorage
  const saveSettings = (newSettings: AppSettings) => {
    if (process.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
        settings.value = { ...newSettings }
      } catch (error) {
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
    const loadedSettings = loadSettings()
    
    // Если сохраненное значение выглядит как код (содержит дефис), конвертируем в ID
    if (loadedSettings.contentLanguageId.includes('-')) {
      const languageId = await getLanguageIdByCode(loadedSettings.contentLanguageId)
      loadedSettings.contentLanguageId = languageId
      saveSettings(loadedSettings)
    }
    
    settings.value = loadedSettings
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