<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

// Initialize auth store on app start
const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initializeAuth();
});

// Предзагрузка критических компонентов для каждого раздела
const route = useRoute()

// Динамический импорт компонентов в зависимости от маршрута
watchEffect(() => {
  const currentPath = route.path
  
  // Предзагрузка компонентов для конкретных разделов
  if (currentPath.includes('/articles')) {
    // Lazy load articles related components
    import('~/components/articles/ArticlesIndexPage.vue')
    import('~/store/articles')
    import('~/composables/api/useArticlesApi')
  } else if (currentPath.includes('/tests')) {
    // Lazy load tests related components
    import('~/components/tests/TestsIndexPage.vue')
    import('~/store/tests')
    import('~/composables/api/useTestsApi')
  } else if (currentPath.includes('/dashboard')) {
    // Lazy load dashboard related components
    import('~/components/dashboard/DashboardIndexPage.vue')
  } else if (currentPath.includes('/login')) {
    // Lazy load login related components
    import('~/components/login/LoginIndexPage.vue')
  }
})

// Метаданные приложения
useHead({
  titleTemplate: '%s - Vozacki Admin',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'Административная панель Vozacki' }
  ]
})
</script>

<style>
/* Глобальные стили приложения */
#app {
  min-height: 100vh;
}
</style>
