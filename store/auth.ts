import { defineStore } from "pinia";
import type { AuthState, LoginRequest, AdministratorUser } from "~/types/auth";

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

  async function login(payload: LoginRequest): Promise<{ error?: string | null }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiLogin(payload);

      if (response.error) {
        error.value = response.error;
        return { error: response.error };
      }

      user.value = response.user;
      session.value = response.session;

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

  function $reset(): void {
    user.value = null;
    session.value = null;
    loading.value = false;
    error.value = null;
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
    $reset,
  };
}); 