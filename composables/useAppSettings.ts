export interface AppSettings {
  contentLanguageId: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  contentLanguageId: 'sr-lat' // По умолчанию sr-lat
}

const STORAGE_KEY = 'app-settings'

export const useAppSettings = () => {
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })

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
        console.warn('Failed to load app settings:', error)
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
        console.error('Failed to save app settings:', error)
      }
    }
  }

  // Обновление языка контента
  const setContentLanguage = (languageId: string) => {
    const newSettings = {
      ...settings.value,
      contentLanguageId: languageId
    }
    saveSettings(newSettings)
  }

  // Инициализация настроек
  const initSettings = () => {
    settings.value = loadSettings()
  }

  // Computed свойства
  const contentLanguageId = computed<string>({
    get: () => settings.value.contentLanguageId,
    set: (value) => setContentLanguage(value)
  })

  return {
    settings: readonly(settings),
    contentLanguageId,
    setContentLanguage,
    initSettings,
    saveSettings,
    loadSettings
  }
} 