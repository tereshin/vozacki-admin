import type { LanguageResource } from '~/types/languages'
import { useCacheManager } from './useCacheManager'

export const useCachedLanguages = () => {
  const cacheManager = useCacheManager()

  // Реактивные данные для кэшированных языков
  const cachedLanguages = ref<LanguageResource[]>([])
  const cachedActiveLanguages = ref<LanguageResource[]>([])

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Загрузка всех языков
  const loadLanguages = async (force = false): Promise<LanguageResource[]> => {
    if (cachedLanguages.value.length > 0 && !force) {
      return cachedLanguages.value
    }

    try {
      isLoading.value = true
      error.value = null
      cachedLanguages.value = await cacheManager.getCachedLanguages()
      return cachedLanguages.value
    } catch (err) {
      error.value = 'Failed to load languages'
      console.error('Error loading cached languages:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Загрузка активных языков
  const loadActiveLanguages = async (force = false): Promise<LanguageResource[]> => {
    if (cachedActiveLanguages.value.length > 0 && !force) {
      return cachedActiveLanguages.value
    }

    try {
      isLoading.value = true
      error.value = null
      cachedActiveLanguages.value = await cacheManager.getCachedActiveLanguages()
      return cachedActiveLanguages.value
    } catch (err) {
      error.value = 'Failed to load active languages'
      console.error('Error loading cached active languages:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Получение языка по коду
  const getLanguageByCode = async (code: string): Promise<LanguageResource | null> => {
    const languages = await loadLanguages()
    return languages.find(lang => lang.code === code) || null
  }

  // Получение языка по ID
  const getLanguageById = async (id: string): Promise<LanguageResource | null> => {
    const languages = await loadLanguages()
    return languages.find(lang => lang.id === id) || null
  }

  // Принудительное обновление кэша языков
  const refreshLanguages = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      // Очищаем локальные кэши для повторной загрузки
      cachedLanguages.value = []
      cachedActiveLanguages.value = []
      
      // Загружаем данные заново
      await Promise.all([
        loadLanguages(true),
        loadActiveLanguages(true)
      ])
    } catch (err) {
      error.value = 'Failed to refresh languages cache'
      console.error('Error refreshing languages cache:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Computed для опций селектов
  const languageOptions = computed(() => 
    cachedLanguages.value.map(lang => ({
      label: lang.name,
      value: lang.id,
      code: lang.code
    }))
  )

  const activeLanguageOptions = computed(() => 
    cachedActiveLanguages.value.map(lang => ({
      label: lang.name,
      value: lang.id,
      code: lang.code
    }))
  )

  return {
    // Данные
    cachedLanguages: readonly(cachedLanguages),
    cachedActiveLanguages: readonly(cachedActiveLanguages),
    
    // Состояние
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Методы загрузки
    loadLanguages,
    loadActiveLanguages,
    
    // Методы поиска
    getLanguageByCode,
    getLanguageById,
    
    // Обновление
    refreshLanguages,
    
    // Опции для селектов
    languageOptions,
    activeLanguageOptions
  }
} 