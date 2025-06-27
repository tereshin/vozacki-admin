<template>
  <CategoriesIndexPage />
</template>

<script setup lang="ts">
// Meta
definePageMeta({
  middleware: 'auth'
})

// Head
useHead({
  title: 'Categories - Vozacki Admin'
})
</script> 