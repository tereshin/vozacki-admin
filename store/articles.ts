import { defineStore } from "pinia";
import type { MetaResponse } from "~/types/general";
import type { ArticleResource, ArticleResponse, ArticleRequest, ArticleUpdateRequest } from "~/types/articles";
import { useArticlesApi } from "~/composables/api/useArticlesApi";

export const useArticlesStore = defineStore("articles", () => {
  // State
  const items = ref<ArticleResource[]>([]);
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
  async function getArticles(payload?: any): Promise<ArticleResponse> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getArticles } = useArticlesApi();
      const response = await getArticles(payload);
      
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

  async function getSingleArticle(id: string): Promise<ArticleResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getSingleArticle } = useArticlesApi();
      const response = await getSingleArticle(id);
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createArticle(body: ArticleRequest): Promise<ArticleResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { createArticle } = useArticlesApi();
      const response = await createArticle(body);
      
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

  async function updateArticle(id: string, body: ArticleUpdateRequest): Promise<ArticleResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { updateArticle } = useArticlesApi();
      const response = await updateArticle(id, body);
      
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

  async function deleteArticle(id: string): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const { deleteArticle } = useArticlesApi();
      await deleteArticle(id);
      
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
    getArticles,
    getSingleArticle,
    createArticle,
    updateArticle,
    deleteArticle,
  };
}); 