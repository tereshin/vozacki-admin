import type { LoginRequest, LoginResponse, AdministratorUser } from "~/types/auth";
import { useApiErrorHandler } from './utils/useApiErrorHandler'

export const useAuthApi = () => {
  const { handleError } = useApiErrorHandler()

  const login = async (payload: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await $fetch<{ success: boolean; data: { user: AdministratorUser; access_token: string; expires_in: number } }>('/api/auth/login', {
        method: 'POST',
        body: payload
      })

      if (!response.success) {
        return {
          user: null,
          session: null,
          error: "Ошибка авторизации",
        };
      }
      
      // Создаем объект session для совместимости
      const session = {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        user: response.data.user
      }

      return {
        user: response.data.user,
        session: session,
      };
    } catch (error: any) {
      console.error('Login catch error:', error)
      handleError(error, 'logging in')
      return {
        user: null,
        session: null,
        error: error.data?.message || error.message || "Произошла ошибка при авторизации",
      };
    }
  };

  const logout = async (): Promise<{ error?: string }> => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })

      return {};
    } catch (error: any) {
      handleError(error, 'logging out')
      return { error: error.message || "Произошла ошибка при выходе" };
    }
  };

  const getCurrentUser = async (): Promise<{ user: AdministratorUser | null; error?: string }> => {
    try {
      // Проверяем наличие токена в cookies на клиенте
      if (typeof window !== 'undefined') {
        const token = useCookie('access_token')
        if (!token.value) {
          return { user: null, error: "No authentication token" };
        }
      }

      const response = await $fetch<{ data: AdministratorUser }>('/api/auth/me')
      return { user: response.data };
    } catch (error: any) {
      handleError(error, 'fetching current user')
      return { user: null, error: error.message || "Произошла ошибка при получении пользователя" };
    }
  };

  const getCurrentSession = async () => {
    try {
      // Получаем токен из cookies
      const token = useCookie('access_token')
      
      if (!token.value) {
        return { session: null, error: "No session found" };
      }

      // Создаем объект session для совместимости
      const session = {
        access_token: token.value,
        expires_in: 86400 // 24 hours
      }

      return { session };
    } catch (error: any) {
      handleError(error, 'fetching current session')
      return { session: null, error: error.message || "Произошла ошибка при получении сессии" };
    }
  };

  const getCurrentAdministrator = async (): Promise<{ user: AdministratorUser | null; error?: string }> => {
    try {
      const response = await $fetch<{ data: AdministratorUser }>('/api/auth/me')
      return { user: response.data };
    } catch (error: any) {
      handleError(error, 'fetching administrator data')
      return { 
        user: null, 
        error: error.message || "Произошла ошибка при получении данных администратора" 
      };
    }
  };

  return {
    login,
    logout,
    getCurrentUser,
    getCurrentSession,
    getCurrentAdministrator,
  };
}; 