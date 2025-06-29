export default defineNuxtPlugin(async (nuxtApp) => {
  // Инициализируем кэш только на клиенте
  if (import.meta.client) {
    try {
      const { initializeCache } = await import('~/composables/cache/useCacheManager').then(m => m.useCacheManager())
      
      // Инициализируем кэш синхронно при загрузке приложения
      await initializeCache()
    } catch (error: any) {
    }
  }
}) 