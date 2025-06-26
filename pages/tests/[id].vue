<template>
  <TestsSinglePage :test-id="route.params.id" />
</template>

<script setup lang="ts">
  const route = useRoute()

  // Set page meta
  definePageMeta({
    middleware: 'auth'
  })
</script>
