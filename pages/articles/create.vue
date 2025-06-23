<template>
  <ArticlesCreatePage />
</template>

<script setup lang="ts">
// Middleware для защиты страницы
definePageMeta({
  middleware: 'auth'
})

// Page meta
useHead({
  title: 'Vozacki Admin - Create Article'
})
</script> 