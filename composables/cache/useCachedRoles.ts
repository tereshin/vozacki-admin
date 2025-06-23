import type { RoleResource } from '~/types/administrators'
import { useCacheManager } from './useCacheManager'

export const useCachedRoles = () => {
  const cacheManager = useCacheManager()

  // Реактивные данные для кэшированных ролей
  const cachedRoles = ref<RoleResource[]>([])

  const isLoading = ref(false)
  const error = ref<string | null>(null)

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

  // Принудительное обновление кэша ролей
  const refreshRoles = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      // Очищаем локальный кэш для повторной загрузки
      cachedRoles.value = []
      
      // Загружаем данные заново
      await loadRoles(true)
    } catch (err) {
      error.value = 'Failed to refresh roles cache'
      console.error('Error refreshing roles cache:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Computed для опций селектов
  const roleOptions = computed(() => 
    cachedRoles.value.map(role => ({
      label: role.name,
      value: role.id,
      code: role.code
    }))
  )

  return {
    // Данные
    cachedRoles: readonly(cachedRoles),
    
    // Состояние
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Методы загрузки
    loadRoles,
    
    // Методы поиска
    getRoleByCode,
    getRoleById,
    
    // Обновление
    refreshRoles,
    
    // Опции для селектов
    roleOptions
  }
} 