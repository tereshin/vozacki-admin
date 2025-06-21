import { defineStore } from "pinia";
import type { MetaResponse } from "~/types/general";
import type { LanguageResource, LanguageResponse, LanguageRequest, LanguageUpdateRequest } from "~/types/languages";

export const useLanguagesStore = defineStore("languages", () => {
  // State
  const items = ref<LanguageResource[]>([]);
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
  async function getLanguages(payload?: any): Promise<LanguageResponse> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getLanguages } = useLanguagesApi();
      const response = await getLanguages(payload);
      
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

  async function getSingleLanguage(id: string): Promise<LanguageResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getSingleLanguage } = useLanguagesApi();
      const response = await getSingleLanguage(id);
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createLanguage(body: LanguageRequest): Promise<LanguageResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { createLanguage } = useLanguagesApi();
      const response = await createLanguage(body);
      
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

  async function updateLanguage(id: string, body: LanguageUpdateRequest): Promise<LanguageResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { updateLanguage } = useLanguagesApi();
      const response = await updateLanguage(id, body);
      
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

  async function deleteLanguage(id: string): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const { deleteLanguage } = useLanguagesApi();
      await deleteLanguage(id);
      
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
    getLanguages,
    getSingleLanguage,
    createLanguage,
    updateLanguage,
    deleteLanguage,
  };
}); 