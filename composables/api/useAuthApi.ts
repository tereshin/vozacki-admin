import type { LoginRequest, LoginResponse, User } from "~/types/auth";

export const useAuthApi = () => {
  const supabase = useSupabase();

  const login = async (payload: LoginRequest): Promise<LoginResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: payload.email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message,
        };
      }

      return {
        user: data.user as User | null,
        session: data.session,
      };
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error: error.message || "Произошла ошибка при авторизации",
      };
    }
  };

  const logout = async (): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      return { error: error.message || "Произошла ошибка при выходе" };
    }
  };

  const getCurrentUser = async (): Promise<{ user: User | null; error?: string }> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return { user: null, error: error.message };
      }

      return { user: user as User | null };
    } catch (error: any) {
      return { user: null, error: error.message || "Произошла ошибка при получении пользователя" };
    }
  };

  const getCurrentSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return { session: null, error: error.message };
      }

      return { session };
    } catch (error: any) {
      return { session: null, error: error.message || "Произошла ошибка при получении сессии" };
    }
  };

  return {
    login,
    logout,
    getCurrentUser,
    getCurrentSession,
  };
}; 