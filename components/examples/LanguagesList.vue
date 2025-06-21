<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Список языков</h2>
    
    <!-- Состояние загрузки -->
    <div v-if="languagesStore.loading" class="flex items-center gap-2">
      <div class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      <span>Загрузка языков...</span>
    </div>
    
    <!-- Состояние ошибки -->
    <div v-else-if="languagesStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>Ошибка: {{ languagesStore.error }}</p>
      <button @click="loadLanguages" class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
        Попробовать снова
      </button>
    </div>
    
    <!-- Список языков -->
    <div v-else>
      <div class="mb-4">
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          placeholder="Поиск языков..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div v-if="languagesStore.items.length === 0" class="text-gray-500 text-center py-8">
        Языки не найдены
      </div>
      
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="language in languagesStore.items"
          :key="language.id"
          class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-lg">{{ language.name }}</h3>
              <p class="text-gray-600">{{ language.code }}</p>
              <p v-if="language.script" class="text-sm text-gray-500">{{ language.script }}</p>
            </div>
            <div class="text-right">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  language.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ language.is_active ? 'Активный' : 'Неактивный' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Пагинация -->
      <div v-if="languagesStore.meta.total > languagesStore.meta.per_page" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Показано {{ languagesStore.meta.from }}-{{ languagesStore.meta.to }} из {{ languagesStore.meta.total }} записей
        </div>
        <div class="flex gap-2">
          <button
            @click="goToPage(languagesStore.meta.current_page - 1)"
            :disabled="languagesStore.meta.current_page <= 1"
            class="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Назад
          </button>
          <span class="px-3 py-1 bg-blue-500 text-white rounded">
            {{ languagesStore.meta.current_page }}
          </span>
          <button
            @click="goToPage(languagesStore.meta.current_page + 1)"
            :disabled="languagesStore.meta.current_page >= languagesStore.meta.last_page"
            class="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Вперед
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const languagesStore = useLanguagesStore()

// Реактивные переменные
const searchQuery = ref('')
const currentPage = ref(1)

// Дебаунс для поиска
const debouncedSearch = useDebounceFn(async () => {
  currentPage.value = 1
  await loadLanguages()
}, 300)

// Методы
const loadLanguages = async () => {
  try {
    await languagesStore.getLanguages({
      page: currentPage.value,
      per_page: 12,
      search: searchQuery.value,
      is_active: undefined // можно фильтровать только активные: true
    })
  } catch (error) {
    console.error('Ошибка загрузки языков:', error)
  }
}

const goToPage = async (page: number) => {
  if (page >= 1 && page <= languagesStore.meta.last_page) {
    currentPage.value = page
    await loadLanguages()
  }
}

// Загружаем данные при монтировании компонента
onMounted(() => {
  loadLanguages()
})
</script> 