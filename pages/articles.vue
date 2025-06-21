<template>
    <ArticlesIndexPage />
</template>
<script setup lang="ts">
import ArticlesIndexPage from '~/components/articles/ArticlesIndexPage.vue'

// Middleware для защиты страницы
definePageMeta({
    middleware: 'auth'
});

// Page meta
useHead({
    title: 'Vozacki Admin - Articles'
});
</script>