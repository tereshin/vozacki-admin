export default defineNuxtRouteMiddleware(async (to) => {
  // Проверяем аутентификацию через JWT токен в cookies
  const token = useCookie('access_token');
  const isAuthenticated = !!token.value;

  // Если пользователь не авторизован и пытается попасть на защищенную страницу
  if (!isAuthenticated && to.path !== '/login') {
    return navigateTo('/login');
  }

  // Если пользователь авторизован и пытается попасть на страницу входа
  if (isAuthenticated && to.path === '/login') {
    return navigateTo('/dashboard');
  }

  // Проверяем права доступа к защищенным страницам
  if (isAuthenticated && token.value) {
    // Получаем информацию о текущем администраторе
    let user: any = null;
    
    try {
      // Получаем данные пользователя с сервера
      const response = await $fetch<{ data: any }>('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      });
      user = response.data;
      if (user) {
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
        
        // Проверяем доступ к управлению статьями
        if (to.path.startsWith('/articles') && to.path !== '/articles') {
          if (!user.role || (user.role.code !== 'administrator' && user.role.code !== 'moderator' && user.role.code !== 'guest')) {
            return navigateTo('/articles');
          }
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      // В случае ошибки авторизации очищаем токен и перенаправляем на логин
      if (error && (error as any).status === 401) {
        token.value = null;
        return navigateTo('/login');
      }
      // В случае других ошибок перенаправляем на dashboard
      if (to.path === '/administrators' || to.path === '/roles') {
        return navigateTo('/dashboard');
      }
    }
  }
}); 