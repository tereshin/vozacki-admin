<template>
  <div class="min-h-screen bg-gray-50">
   
  </div>
</template>

<script setup lang="ts">
// Middleware для защиты страницы
definePageMeta({
  middleware: 'auth'
});


// Page meta
useHead({
  title: 'Dashboard - Vozacki Admin',
  meta: [
    { name: 'description', content: 'Административная панель Vozacki' }
  ]
});
</script> 