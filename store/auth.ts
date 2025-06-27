import { defineStore } from "pinia";
import type { AuthState, LoginRequest, AdministratorUser } from "~/types/auth";
import type { AdministratorResource } from "~/types/administrators";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<AdministratorUser | null>(null);
  const session = ref<any | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!session.value);

  // Actions
  const { login: apiLogin, logout: apiLogout, getCurrentUser, getCurrentSession, getCurrentAdministrator } = useAuthApi();
  const { getSingleAdministrator } = useAdministratorsApi();

  async function login(payload: LoginRequest): Promise<{ error?: string | null }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiLogin(payload);

      if (response.error) {
        error.value = response.error;
        return { error: response.error };
      }

      // При magic link авторизации user и session будут null до перехода по ссылке
      // Это нормально и означает что письмо отправлено успешно
      if (response.user && response.session) {
        user.value = response.user;
        session.value = response.session;

        // Получаем полный объект администратора по API и сохраняем в localStorage
        if (response.user?.id) {
          try {
            const administratorResponse = await getSingleAdministrator(response.user.id);
            if (administratorResponse.data && typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(administratorResponse.data));
            }
          } catch (adminError: any) {
            console.error('Ошибка получения данных администратора:', adminError);
          }
        }
      }

      return {};
    } catch (err: any) {
      error.value = err.message || "Произошла ошибка при авторизации";
      return { error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<{ error?: string | null }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiLogout();

      if (response.error) {
        error.value = response.error;
        return { error: response.error };
      }

      user.value = null;
      session.value = null;

      // Очищаем данные администратора из localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }

      // Redirect to login page
      await navigateTo('/login');

      return {};
    } catch (err: any) {
      error.value = err.message || "Произошла ошибка при выходе";
      return { error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function initializeAuth(): Promise<void> {
    loading.value = true;

    try {
      const [userResponse, sessionResponse] = await Promise.all([
        getCurrentAdministrator(),
        getCurrentSession(),
      ]);

      if (userResponse.user && sessionResponse.session) {
        user.value = userResponse.user;
        session.value = sessionResponse.session;

        // Получаем полный объект администратора по API и сохраняем в localStorage
        if (userResponse.user?.id) {
          try {
            const administratorResponse = await getSingleAdministrator(userResponse.user.id);
            if (administratorResponse.data && typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(administratorResponse.data));
            }
          } catch (adminError: any) {
            console.error('Ошибка получения данных администратора:', adminError);
          }
        }
      }
    } catch (err: any) {
      console.error("Ошибка инициализации авторизации:", err);
    } finally {
      loading.value = false;
    }
  }

  function clearError(): void {
    error.value = null;
  }

  function getCurrentAdministratorFromStorage(): AdministratorResource | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        return JSON.parse(stored) as AdministratorResource;
      }
    } catch (error) {
      console.error('Ошибка при получении администратора из localStorage:', error);
      localStorage.removeItem('user');
    }
    
    return null;
  }

  function $reset(): void {
    user.value = null;
    session.value = null;
    loading.value = false;
    error.value = null;
    
    // Очищаем данные администратора из localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

      return {
      // State
      user: readonly(user),
      session: readonly(session),
      loading: readonly(loading),
      error: readonly(error),
      
      // Getters
      isAuthenticated,
      
      // Actions
      login,
      logout,
      initializeAuth,
      clearError,
      getCurrentAdministratorFromStorage,
      $reset,
    };
}); 