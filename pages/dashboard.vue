<template>
  <DashboardIndexPage />
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