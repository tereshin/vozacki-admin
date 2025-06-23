<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <span name="i-heroicons-arrow-path" class="mx-auto h-12 w-12 text-primary-600 animate-spin" />
      <h2 class="mt-4 text-lg font-medium text-gray-900">
        Загрузка...
      </h2>
      <p class="mt-2 text-sm text-gray-600">
        Проверяем авторизацию
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

const authStore = useAuthStore();

onMounted(async () => {
  // Инициализируем авторизацию
  await authStore.initializeAuth();
  
  // Перенаправляем в зависимости от статуса авторизации
  if (authStore.isAuthenticated) {
    await navigateTo('/dashboard');
  } else {
    await navigateTo('/login');
  }
});

// Page meta
useHead({
  title: 'Vozacki Admin',
  meta: [
    { name: 'description', content: 'Административная панель Vozacki' }
  ]
});
</script> 