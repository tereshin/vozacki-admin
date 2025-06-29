export const useAuthenticatedFetch = () => {
  const authenticatedFetch = async <T = any>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: any
      query?: Record<string, any>
      headers?: Record<string, string>
    } = {}
  ): Promise<T> => {
    try {
      // Получаем токен из cookies
      const token = useCookie('access_token')
      
      // Формируем заголовки с авторизацией
      const headers: Record<string, string> = {
        ...options.headers
      }
      
      if (token.value) {
        headers.Authorization = `Bearer ${token.value}`
      }

      // Выполняем запрос
      return await $fetch(url, {
        ...options,
        headers
      }) as T
    } catch (error) {
      console.error('Authenticated fetch error:', error)
      throw error
    }
  }

  return {
    authenticatedFetch
  }
} 