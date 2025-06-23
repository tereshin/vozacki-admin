import { defineStore } from "pinia";
import type { MetaResponse } from "~/types/general";
import type { CategoryResource, CategoryResponse, CategoryRequest, CategoryUpdateRequest } from "~/types/categories";

export const useCategoriesStore = defineStore("categories", () => {
  // State
  const items = ref<CategoryResource[]>([]);
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
  async function getCategories(payload?: any): Promise<CategoryResponse> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getCategories } = useCategoriesApi();
      const response = await getCategories(payload);
      
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

  async function getSingleCategory(id: string): Promise<CategoryResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getSingleCategory } = useCategoriesApi();
      const response = await getSingleCategory(id);
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createCategory(body: CategoryRequest): Promise<CategoryResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { createCategory } = useCategoriesApi();
      const response = await createCategory(body);
      
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

  async function updateCategory(id: string, body: CategoryUpdateRequest): Promise<CategoryResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { updateCategory } = useCategoriesApi();
      const response = await updateCategory(id, body);
      
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

  async function deleteCategory(id: string): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const { deleteCategory } = useCategoriesApi();
      await deleteCategory(id);
      
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
    getCategories,
    getSingleCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}); 