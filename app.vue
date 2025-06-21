<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

// Initialize auth store on app start
const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initializeAuth();
});
</script>
