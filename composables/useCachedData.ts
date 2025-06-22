import type { LanguageResource } from '~/types/languages'
import type { RoleResource } from '~/types/administrators'
import { useCacheManager } from './useCacheManager'

export const useCachedData = () => {
  const cacheManager = useCacheManager()

  // Реактивные данные для кэшированных языков и ролей
  const cachedLanguages = ref<LanguageResource[]>([])
  const cachedRoles = ref<RoleResource[]>([])
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

  // Загрузка всех ролей
  const loadRoles = async (force = false): Promise<RoleResource[]> => {
    if (cachedRoles.value.length > 0 && !force) {
      return cachedRoles.value
    }

    try {
      isLoading.value = true
      error.value = null
      cachedRoles.value = await cacheManager.getCachedRoles()
      return cachedRoles.value
    } catch (err) {
      error.value = 'Failed to load roles'
      console.error('Error loading cached roles:', err)
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

  // Получение роли по коду
  const getRoleByCode = async (code: string): Promise<RoleResource | null> => {
    const roles = await loadRoles()
    return roles.find(role => role.code === code) || null
  }

  // Получение роли по ID
  const getRoleById = async (id: string): Promise<RoleResource | null> => {
    const roles = await loadRoles()
    return roles.find(role => role.id === id) || null
  }

  // Принудительное обновление кэша
  const refreshCache = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      await cacheManager.forceUpdateCache()
      
      // Очищаем локальные кэши для повторной загрузки
      cachedLanguages.value = []
      cachedRoles.value = []
      cachedActiveLanguages.value = []
      
      // Загружаем данные заново
      await Promise.all([
        loadLanguages(true),
        loadRoles(true),
        loadActiveLanguages(true)
      ])
    } catch (err) {
      error.value = 'Failed to refresh cache'
      console.error('Error refreshing cache:', err)
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

  const roleOptions = computed(() => 
    cachedRoles.value.map(role => ({
      label: role.name,
      value: role.id,
      code: role.code
    }))
  )

  return {
    // Данные
    cachedLanguages: readonly(cachedLanguages),
    cachedRoles: readonly(cachedRoles),
    cachedActiveLanguages: readonly(cachedActiveLanguages),
    
    // Состояние
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Методы загрузки
    loadLanguages,
    loadRoles,
    loadActiveLanguages,
    
    // Методы поиска
    getLanguageByCode,
    getLanguageById,
    getRoleByCode,
    getRoleById,
    
    // Обновление
    refreshCache,
    
    // Опции для селектов
    languageOptions,
    activeLanguageOptions,
    roleOptions
  }
} 