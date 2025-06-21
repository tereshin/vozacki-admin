export default defineNuxtRouteMiddleware(async (to) => {
  // Проверяем аутентификацию через supabase напрямую
  const supabase = useSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  
  const isAuthenticated = !!session;

  // Если пользователь не авторизован и пытается попасть на защищенную страницу
  if (!isAuthenticated && to.path !== '/login') {
    return navigateTo('/login');
  }

  // Если пользователь авторизован и пытается попасть на страницу входа
  if (isAuthenticated && to.path === '/login') {
    return navigateTo('/dashboard');
  }
}); 