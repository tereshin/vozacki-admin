<template>
    <TestsIndexPage />
  </template>
  <script setup lang="ts">
  // Middleware для защиты страницы
  definePageMeta({
    middleware: 'auth'
  });
  
  
  // Page meta
  useHead({
    title: 'Topics - Vozacki Admin'
  });
  </script>