# Шаблоны для создания новых сущностей

## 1. Шаблон типов (`types/{entity}.ts`)

```typescript
import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

export interface {Entity}Resource extends Tables<'{table_name}'> {
  // Дополнительные вычисляемые поля
}

export interface {Entity}Response {
  data: {
    collection: {Entity}Resource[];
    meta: MetaResponse;
  };
}

export interface Single{Entity}Response {
  data: {Entity}Resource;
}

export interface {Entity}Request extends TablesInsert<'{table_name}'> {}

export interface {Entity}UpdateRequest extends TablesUpdate<'{table_name}'> {}

export interface ErrorDetails{Entity} {
  // Поля для валидации ошибок
  field_name?: string[];
}
```

## 2. Шаблон API composable (`composables/api/use{Entity}Api.ts`)

```typescript
import type { 
  {Entity}Resource, 
  {Entity}Request, 
  {Entity}UpdateRequest,
  {Entity}Response,
  Single{Entity}Response 
} from '~/types/{entity}'

export const use{Entity}Api = () => {
  const supabase = useSupabase()

  const get{Entity}s = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    // Дополнительные фильтры
  }): Promise<{Entity}Response> => {
    try {
      let query = supabase
        .from('{table_name}')
        .select('*', { count: 'exact' })

      if (params?.search) {
        query = query.or(`field1.ilike.%${params.search}%,field2.ilike.%${params.search}%`)
      }

      // Дополнительные фильтры
      // if (params?.filter_field) {
      //   query = query.eq('filter_field', params.filter_field)
      // }

      const page = params?.page || 1
      const perPage = params?.per_page || 10
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      query = query.range(from, to).order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) throw error

      const collection = (data || []) as {Entity}Resource[]

      return {
        data: {
          collection,
          meta: {
            current_page: page,
            from: from + 1,
            last_page: Math.ceil((count || 0) / perPage),
            per_page: perPage,
            to: Math.min(to + 1, count || 0),
            total: count || 0
          }
        }
      }
    } catch (error) {
      console.error('Error fetching {entity}s:', error)
      throw error
    }
  }

  const getSingle{Entity} = async (id: string): Promise<Single{Entity}Response> => {
    try {
      const { data, error } = await supabase
        .from('{table_name}')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data: data as {Entity}Resource
      }
    } catch (error) {
      console.error('Error fetching {entity}:', error)
      throw error
    }
  }

  const create{Entity} = async (body: {Entity}Request): Promise<Single{Entity}Response> => {
    try {
      const { data, error } = await supabase
        .from('{table_name}')
        .insert(body)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as {Entity}Resource
      }
    } catch (error) {
      console.error('Error creating {entity}:', error)
      throw error
    }
  }

  const update{Entity} = async (id: string, body: {Entity}UpdateRequest): Promise<Single{Entity}Response> => {
    try {
      const { data, error } = await supabase
        .from('{table_name}')
        .update(body)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as {Entity}Resource
      }
    } catch (error) {
      console.error('Error updating {entity}:', error)
      throw error
    }
  }

  const delete{Entity} = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('{table_name}')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting {entity}:', error)
      throw error
    }
  }

  return {
    get{Entity}s,
    getSingle{Entity},
    create{Entity},
    update{Entity},
    delete{Entity}
  }
}
```

## 3. Шаблон Store (`store/{entity}.ts`)

```typescript
import { defineStore } from "pinia";
import type { MetaResponse } from "~/types/general";
import type { {Entity}Resource, {Entity}Response, {Entity}Request, {Entity}UpdateRequest } from "~/types/{entity}";

export const use{Entity}Store = defineStore("{entity}", () => {
  // State
  const items = ref<{Entity}Resource[]>([]);
  const meta = ref<MetaResponse>({
    current_page: 1,
    from: 1,
    last_page: 1,
    per_page: 10,
    to: 10,
    total: 0,
  });
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  async function get{Entity}s(payload?: any): Promise<{Entity}Response> {
    loading.value = true;
    error.value = null;
    
    try {
      const { get{Entity}s } = use{Entity}Api();
      const response = await get{Entity}s(payload);
      
      items.value = response.data.collection;
      meta.value = response.data.meta;
      
      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getSingle{Entity}(id: string): Promise<{Entity}Resource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getSingle{Entity} } = use{Entity}Api();
      const response = await getSingle{Entity}(id);
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function create{Entity}(body: {Entity}Request): Promise<{Entity}Resource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { create{Entity} } = use{Entity}Api();
      const response = await create{Entity}(body);
      
      // Add to items array
      items.value.unshift(response.data);
      meta.value.total += 1;
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function update{Entity}(id: string, body: {Entity}UpdateRequest): Promise<{Entity}Resource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { update{Entity} } = use{Entity}Api();
      const response = await update{Entity}(id, body);
      
      // Update in items array
      const index = items.value.findIndex(item => item.id === id);
      if (index !== -1) {
        items.value[index] = response.data;
      }
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function delete{Entity}(id: string): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const { delete{Entity} } = use{Entity}Api();
      await delete{Entity}(id);
      
      // Remove from items array
      const index = items.value.findIndex(item => item.id === id);
      if (index !== -1) {
        items.value.splice(index, 1);
        meta.value.total -= 1;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    items,
    meta,
    loading,
    error,
    get{Entity}s,
    getSingle{Entity},
    create{Entity},
    update{Entity},
    delete{Entity},
  };
});
```

## 4. Шаблон компонента списка (`components/{entity}/{Entity}List.vue`)

```vue
<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">{Entity} List</h2>
    
    <!-- Loading State -->
    <div v-if="{entity}Store.loading" class="flex items-center gap-2">
      <div class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      <span>Loading {entity}s...</span>
    </div>
    
    <!-- Error State -->
    <div v-else-if="{entity}Store.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>Error: {{ {entity}Store.error }}</p>
      <button @click="load{Entity}s" class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
        Try Again
      </button>
    </div>
    
    <!-- Content -->
    <div v-else>
      <!-- Search -->
      <div class="mb-4">
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          placeholder="Search {entity}s..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <!-- Empty State -->
      <div v-if="{entity}Store.items.length === 0" class="text-gray-500 text-center py-8">
        No {entity}s found
      </div>
      
      <!-- Items Grid -->
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="{entity} in {entity}Store.items"
          :key="{entity}.id"
          class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- Item content -->
          <h3 class="font-semibold text-lg">{{ {entity}.name || {entity}.title }}</h3>
          <p class="text-gray-600">{{ {entity}.description || {entity}.email }}</p>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="{entity}Store.meta.total > {entity}Store.meta.per_page" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing {{ {entity}Store.meta.from }}-{{ {entity}Store.meta.to }} of {{ {entity}Store.meta.total }} results
        </div>
        <div class="flex gap-2">
          <button
            @click="goToPage({entity}Store.meta.current_page - 1)"
            :disabled="{entity}Store.meta.current_page <= 1"
            class="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Previous
          </button>
          <span class="px-3 py-1 bg-blue-500 text-white rounded">
            {{ {entity}Store.meta.current_page }}
          </span>
          <button
            @click="goToPage({entity}Store.meta.current_page + 1)"
            :disabled="{entity}Store.meta.current_page >= {entity}Store.meta.last_page"
            class="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {entity}Store = use{Entity}Store()

const searchQuery = ref('')
const currentPage = ref(1)

const debouncedSearch = useDebounceFn(async () => {
  currentPage.value = 1
  await load{Entity}s()
}, 300)

const load{Entity}s = async () => {
  try {
    await {entity}Store.get{Entity}s({
      page: currentPage.value,
      per_page: 12,
      search: searchQuery.value
    })
  } catch (error) {
    console.error('Error loading {entity}s:', error)
  }
}

const goToPage = async (page: number) => {
  if (page >= 1 && page <= {entity}Store.meta.last_page) {
    currentPage.value = page
    await load{Entity}s()
  }
}

onMounted(() => {
  load{Entity}s()
})
</script>
```

## Инструкции по использованию шаблонов

1. Замените `{Entity}` на название сущности в PascalCase (например, `Category`)
2. Замените `{entity}` на название сущности в camelCase (например, `category`)
3. Замените `{table_name}` на имя таблицы в базе данных (например, `categories`)
4. Настройте поля для поиска и фильтрации в API composable
5. Обновите отображение данных в компоненте под вашу структуру данных
6. Добавьте экспорт новых типов в `types/index.ts` 