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

  // Проверяем права доступа к защищенным страницам
  if (isAuthenticated && session?.access_token) {
    // Получаем информацию о текущем администраторе
    try {
      const response = await $fetch<{ data: any }>('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const user = response.data;
      
      // Проверяем доступ к странице администраторов
      if (to.path === '/administrators') {
        if (!user.role || user.role.code !== 'administrator') {
          return navigateTo('/dashboard');
        }
      }
      
      // Проверяем доступ к странице ролей
      if (to.path === '/roles') {
        if (!user.role || user.role.code !== 'administrator') {
          return navigateTo('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      // В случае ошибки перенаправляем на dashboard
      if (to.path === '/administrators' || to.path === '/roles') {
        return navigateTo('/dashboard');
      }
    }
  }
}); 