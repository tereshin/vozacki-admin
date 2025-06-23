<template>
    <ArticlesIndexPage />
</template>
<script setup lang="ts">
// Middleware для защиты страницы
definePageMeta({
    middleware: 'auth'
});

// Page meta
useHead({
    title: 'Vozacki Admin - Articles'
});
</script>