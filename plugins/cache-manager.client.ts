export default defineNuxtPlugin(async (nuxtApp) => {
  console.log('Initializing cache manager plugin...')
  
  // Инициализируем кэш только на клиенте
  if (import.meta.client) {
    try {
      const { initializeCache } = await import('~/composables/useCacheManager').then(m => m.useCacheManager())
      
      // Инициализируем кэш синхронно при загрузке приложения
      await initializeCache()
      
      console.log('Cache manager plugin initialized successfully')
    } catch (error: any) {
      console.error('Failed to initialize cache manager plugin:', error)
    }
  }
}) 