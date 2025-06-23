export const useAuthenticatedFetch = () => {
  const supabase = useSupabase()

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
      // Получаем текущую сессию
      const { data: { session } } = await supabase.auth.getSession()
      
      // Формируем заголовки с авторизацией
      const headers: Record<string, string> = {
        ...options.headers
      }
      
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`
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