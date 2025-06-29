import { defineStore } from "pinia";
import type { AuthState, LoginRequest, AdministratorUser } from "~/types/auth";
import type { AdministratorResource } from "~/types/administrators";

// Типизация для session
interface SessionData {
  access_token: string;
  expires_in: number;
}

/**
 * Сохраняет пользователя в localStorage
 */
function saveUserToStorage(userData: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(userData));
  }
}

/**
 * Удаляет пользователя из localStorage
 */
function removeUserFromStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

/**
 * Получает пользователя из localStorage
 */
function getUserFromStorage(): AdministratorResource | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      return JSON.parse(stored) as AdministratorResource;
    }
  } catch (error) {
    console.error('Ошибка при получении администратора из localStorage:', error);
    removeUserFromStorage();
  }
  return null;
}

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<AdministratorUser | null>(null);
  const session = ref<SessionData | null>(null);
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

  /**
   * Авторизация пользователя
   */
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
      if (response.user?.id) {
        try {
          const { data } = await getSingleAdministrator(response.user.id);
          if (data) adminData = data;
        } catch (e) {
          console.error('Ошибка получения администратора:', e);
        }
      }
      user.value = adminData || response.user;
      session.value = response.session;
      saveUserToStorage(user.value);
      return {};
    } catch (err: any) {
      error.value = err.message || "Произошла ошибка при авторизации";
      console.error("Ошибка авторизации:", err);
      return { error: error.value };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Выход пользователя
   */
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
      removeUserFromStorage();
      // Redirect to login page (только на клиенте)
      if (typeof window !== 'undefined') {
        await navigateTo('/login');
      }
      return {};
    } catch (err: any) {
      error.value = err.message || "Произошла ошибка при выходе";
      console.error("Ошибка выхода:", err);
      return { error: error.value };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Инициализация авторизации при старте приложения
   */
  async function initializeAuth(): Promise<void> {
    loading.value = true;
    try {
      const token = useCookie('access_token');
      if (!token.value) {
        user.value = null;
        session.value = null;
        return;
      }
      // Получаем id администратора из localStorage или через getCurrentUser
      let adminId: string | null = null;
      const storedUser = getUserFromStorage();
      if (storedUser?.id) {
        adminId = storedUser.id;
      }
      if (!adminId) {
        // fallback: получаем текущего пользователя через getCurrentUser
        const userResponse = await getCurrentUser();
        if (userResponse.user?.id) {
          adminId = userResponse.user.id;
        }
      }
      if (adminId) {
        try {
          const { data } = await getSingleAdministrator(adminId);
          if (data) {
            user.value = data;
            session.value = {
              access_token: token.value,
              expires_in: 86400
            };
            saveUserToStorage(data);
            return;
          }
        } catch (e) {
          console.error('Ошибка получения администратора при инициализации:', e);
        }
      }
      // fallback: очищаем состояние
      token.value = null;
      user.value = null;
      session.value = null;
      removeUserFromStorage();
    } catch (err: any) {
      console.error("Ошибка инициализации авторизации:", err);
      const token = useCookie('access_token');
      token.value = null;
      user.value = null;
      session.value = null;
      removeUserFromStorage();
    } finally {
      loading.value = false;
    }
  }

  /**
   * Сброс ошибки
   */
  function clearError(): void {
    error.value = null;
  }

  /**
   * Получить администратора из localStorage
   */
  function getCurrentAdministratorFromStorage(): AdministratorResource | null {
    return getUserFromStorage();
  }

  /**
   * Полный сброс состояния авторизации
   */
  function $reset(): void {
    user.value = null;
    session.value = null;
    loading.value = false;
    error.value = null;
    const token = useCookie('access_token');
    token.value = null;
    removeUserFromStorage();
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