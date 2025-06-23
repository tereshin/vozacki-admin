<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <TheSidebarMenu />

    <!-- Main Content -->
    <div class="transition-all duration-300 ease-in-out  min-h-screen"
      :class="!generalStore.isMobile && generalStore.isMenuOpen ? 'lg:ml-64' : ''">
      <!-- Content -->
      <div class="container mx-auto">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGeneralStore } from '@/store/general';

// Stores
const generalStore = useGeneralStore();
// Устанавливаем title страницы
useHead({
  title: 'Авторизация - Vozacki Admin',
  meta: [
    { name: 'description', content: 'Страница авторизации для административной панели Vozacki' }
  ]
});
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }

  33% {
    transform: translate(30px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>