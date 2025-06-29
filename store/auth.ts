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
  const isAuthenticated = computed(() => {
    // Проверяем наличие JWT токена в cookies
    const token = useCookie('access_token');
    return !!token.value && !!user.value;
  });

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

      // Устанавливаем токен в cookie (если ещё не установлен сервером)
      if (response.session?.access_token) {
        const token = useCookie('access_token');
        token.value = response.session.access_token;
      }

      // Получаем расширенные данные администратора через getSingleAdministrator
      let adminData = null;
      if (response.user && response.user.id) {
        try {
          const { data } = await getSingleAdministrator(response.user.id);
          if (data) {
            adminData = data;
          }
        } catch (e) {
          // fallback ниже
        }
      }

      if (adminData) {
        user.value = adminData;
        session.value = response.session;
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(adminData));
        }
      } else {
        // fallback: если не удалось получить администратора, сохраняем supabase user
        user.value = response.user;
        session.value = response.session;
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.user));
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

      // Очищаем состояние
      user.value = null;
      session.value = null;

      // Очищаем токен из cookie
      const token = useCookie('access_token');
      token.value = null;

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
      // Проверяем наличие токена в cookies
      const token = useCookie('access_token');
      
      if (!token.value) {
        // Нет токена - очищаем состояние
        user.value = null;
        session.value = null;
        return;
      }

      // Получаем id администратора из localStorage или через getCurrentUser
      let adminId: string | null = null;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.id) {
              adminId = parsed.id;
            }
          } catch {}
        }
      }
      if (!adminId) {
        // fallback: получаем текущего пользователя через getCurrentUser
        const userResponse = await getCurrentUser();
        if (userResponse.user && userResponse.user.id) {
          adminId = userResponse.user.id;
        }
      }

      if (adminId) {
        try {
          const { data } = await getSingleAdministrator(adminId);
          if (data) {
            user.value = data;
            // Создаем объект session для совместимости
            session.value = {
              access_token: token.value,
              expires_in: 86400
            };
            // Сохраняем в localStorage для кеша
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(data));
            }
            loading.value = false;
            return;
          }
        } catch {}
      }
      // fallback: очищаем состояние
      token.value = null;
      user.value = null;
      session.value = null;
    } catch (err: any) {
      console.error("Ошибка инициализации авторизации:", err);
      // При ошибке очищаем состояние
      const token = useCookie('access_token');
      token.value = null;
      user.value = null;
      session.value = null;
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
    
    // Очищаем токен и данные из cookies/localStorage
    const token = useCookie('access_token');
    token.value = null;
    
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