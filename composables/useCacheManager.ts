import type { LanguageResource } from '~/types/languages'
import type { RoleResource } from '~/types/administrators'
import { useIndexedDB } from './utils/useIndexedDB'

// Синглтон для кэш-менеджера
let cacheManagerInstance: ReturnType<typeof createCacheManager> | null = null

const createCacheManager = () => {
  const { initDB, saveLanguages, saveRoles, getLanguages, getRoles, getActiveLanguages, saveCacheMeta, getCacheMeta } = useIndexedDB()
  const languagesApi = useLanguagesApi()
  const rolesApi = useRolesApi()
  
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const lastCacheUpdate = ref<Date | null>(null)
  
  // Время жизни кэша (в миллисекундах) - 1 час
  const CACHE_LIFETIME = 60 * 60 * 1000

  const shouldUpdateCache = (): boolean => {
    if (!lastCacheUpdate.value) return true
    
    const now = new Date()
    const timeDiff = now.getTime() - lastCacheUpdate.value.getTime()
    
    return timeDiff > CACHE_LIFETIME
  }

  // Загружаем сохраненное время последнего обновления
  const loadLastUpdateTime = async (): Promise<void> => {
    try {
      const savedTime = await getCacheMeta()
      if (savedTime) {
        lastCacheUpdate.value = savedTime
        console.log('Loaded last cache update time:', savedTime)
      }
    } catch (error) {
      console.warn('Failed to load last update time:', error)
    }
  }

  // Проверяет, есть ли данные в кэше
  const hasCachedData = async (): Promise<{ hasLanguages: boolean; hasRoles: boolean }> => {
    try {
      const [languages, roles] = await Promise.all([
        getLanguages(),
        getRoles()
      ])
      
      return {
        hasLanguages: languages.length > 0,
        hasRoles: roles.length > 0
      }
    } catch (error) {
      console.warn('Failed to check cached data:', error)
      return { hasLanguages: false, hasRoles: false }
    }
  }

  const initializeCache = async (): Promise<void> => {
    if (isInitialized.value) return
    
    try {
      isLoading.value = true
      
      // Инициализируем IndexedDB
      await initDB()
      
      // Загружаем сохраненное время последнего обновления
      await loadLastUpdateTime()
      
      // Проверяем наличие данных в кэше
      const cacheStatus = await hasCachedData()
      const needsUpdate = shouldUpdateCache()
      
      // Логика обновления кэша:
      const hasMissingData = !cacheStatus.hasLanguages || !cacheStatus.hasRoles
      
      if (hasMissingData) {
        // Есть недостающие данные - селективное обновление
        console.log('Missing cache data detected:', { 
          hasLanguages: cacheStatus.hasLanguages, 
          hasRoles: cacheStatus.hasRoles 
        })
        await updateCacheSelective(cacheStatus)
      } else if (needsUpdate) {
        // Данные есть, но кэш устарел - полное обновление
        console.log('Cache expired, performing full update')
        await updateCache()
      } else {
        console.log('Cache is up to date, skipping server requests')
        // Устанавливаем время последнего обновления, если данные есть но время не установлено
        if (!lastCacheUpdate.value) {
          lastCacheUpdate.value = new Date()
          await saveCacheMeta(lastCacheUpdate.value)
        }
      }
      
      isInitialized.value = true
      console.log('Cache manager initialized successfully')
    } catch (error) {
      console.error('Failed to initialize cache manager:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateCache = async (): Promise<void> => {
    try {
      console.log('Updating cache from server...')
      
      // Загружаем все языки
      const languagesResponse = await languagesApi.getLanguages({ per_page: 1000 })
      const languages = languagesResponse.data.collection
      
      // Загружаем все роли
      const roles = await rolesApi.getAllRoles()
      
      // Сохраняем в IndexedDB
      await Promise.all([
        saveLanguages(languages),
        saveRoles(roles)
      ])
      
      lastCacheUpdate.value = new Date()
      await saveCacheMeta(lastCacheUpdate.value)
      console.log('Cache updated successfully')
    } catch (error) {
      console.error('Failed to update cache:', error)
      throw error
    }
  }

  // Селективное обновление кэша - обновляет только недостающие данные
  const updateCacheSelective = async (cacheStatus: { hasLanguages: boolean; hasRoles: boolean }): Promise<void> => {
    try {
      console.log('Selective cache update...')
      const promises: Promise<any>[] = []
      
      // Загружаем языки только если их нет в кэше
      if (!cacheStatus.hasLanguages) {
        console.log('Loading languages from server...')
        promises.push(
          languagesApi.getLanguages({ per_page: 1000 })
            .then(response => saveLanguages(response.data.collection))
        )
      }
      
      // Загружаем роли только если их нет в кэше
      if (!cacheStatus.hasRoles) {
        console.log('Loading roles from server...')
        promises.push(
          rolesApi.getAllRoles()
            .then(roles => saveRoles(roles))
        )
      }
      
      // Если есть что обновлять
      if (promises.length > 0) {
        await Promise.all(promises)
        lastCacheUpdate.value = new Date()
        await saveCacheMeta(lastCacheUpdate.value)
        console.log('Selective cache update completed')
      }
    } catch (error) {
      console.error('Failed to update cache selectively:', error)
      throw error
    }
  }

  const getCachedLanguages = async (): Promise<LanguageResource[]> => {
    try {
      await initializeCache()
      return await getLanguages()
    } catch (error) {
      console.error('Failed to get cached languages:', error)
      // Fallback к API если кэш недоступен
      const response = await languagesApi.getLanguages({ per_page: 1000 })
      return response.data.collection
    }
  }

  const getCachedRoles = async (): Promise<RoleResource[]> => {
    try {
      await initializeCache()
      return await getRoles()
    } catch (error) {
      console.error('Failed to get cached roles:', error)
      // Fallback к API если кэш недоступен
      return await rolesApi.getAllRoles()
    }
  }

  const getCachedActiveLanguages = async (): Promise<LanguageResource[]> => {
    try {
      await initializeCache()
      return await getActiveLanguages()
    } catch (error) {
      console.error('Failed to get cached active languages:', error)
      // Fallback к API если кэш недоступен
      const languages = await getCachedLanguages()
      return languages.filter(lang => lang.is_active === true)
    }
  }

  const forceUpdateCache = async (): Promise<void> => {
    lastCacheUpdate.value = null
    await updateCache()
  }

  const clearCache = async (): Promise<void> => {
    try {
      const { clearCache: clearIndexedDBCache } = useIndexedDB()
      await clearIndexedDBCache()
      lastCacheUpdate.value = null
      isInitialized.value = false
      console.log('Cache cleared successfully')
    } catch (error) {
      console.error('Failed to clear cache:', error)
      throw error
    }
  }

  const getCacheStatus = async () => {
    const cacheData = await hasCachedData()
    return {
      isInitialized: isInitialized.value,
      isLoading: isLoading.value,
      lastUpdate: lastCacheUpdate.value,
      shouldUpdate: shouldUpdateCache(),
      hasLanguages: cacheData.hasLanguages,
      hasRoles: cacheData.hasRoles,
      isEmpty: !cacheData.hasLanguages && !cacheData.hasRoles
    }
  }

  return {
    initializeCache,
    updateCache,
    getCachedLanguages,
    getCachedRoles,
    getCachedActiveLanguages,
    forceUpdateCache,
    clearCache,
    getCacheStatus,
    isInitialized: readonly(isInitialized),
    isLoading: readonly(isLoading)
  }
}

export const useCacheManager = () => {
  if (!cacheManagerInstance) {
    cacheManagerInstance = createCacheManager()
  }
  return cacheManagerInstance
} 