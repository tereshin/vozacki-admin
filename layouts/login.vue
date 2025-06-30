<template>
  <div
    class="bg-surface-300/40 h-screen relative"
  >
    <!-- Language Selector -->
    <div class="absolute top-4 right-4 z-10">
      <Select
        v-model="selectedLanguage"
        :options="availableLanguages"
        option-label="localName"
        option-value="code"
        placeholder="Select language"
        class="w-40"
        @update:model-value="changeLanguage"
      >
        <template #value="{ value }">
          <div v-if="value" class="flex items-center gap-2">
            <span>{{ getLanguageFlag(value) }}</span>
            <span>{{ getLanguageName(value) }}</span>
          </div>
        </template>
        <template #option="{ option }">
          <div class="flex items-center gap-2">
            <span>{{ option.flag }}</span>
            <span>{{ option.localName }}</span>
          </div>
        </template>
      </Select>
    </div>

    <!-- Content -->
    <slot />
  </div>
</template>

<script setup lang="ts">
// Language composable
const { 
  currentLanguage, 
  changeLanguage, 
  getLanguageFlag, 
  getLanguageName, 
  availableLanguages 
} = useLanguage();

// Reactive data
const selectedLanguage = ref(currentLanguage.value);

// Watch for locale changes
watch(currentLanguage, (newLocale) => {
  selectedLanguage.value = newLocale;
});
</script>