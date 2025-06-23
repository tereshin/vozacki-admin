import { defineStore } from "pinia";
import type { MetaResponse } from "~/types/general";
import type { ContentUidResource, ContentUidResponse, ContentUidRequest, ContentUidUpdateRequest } from "~/types/content-uids";

export const useContentUidsStore = defineStore("content-uids", () => {
  // State
  const items = ref<ContentUidResource[]>([]);
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
  async function getContentUids(payload?: any): Promise<ContentUidResponse> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getContentUids } = useContentUidsApi();
      const response = await getContentUids(payload);
      
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

  async function getSingleContentUid(uid: string): Promise<ContentUidResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getSingleContentUid } = useContentUidsApi();
      const response = await getSingleContentUid(uid);
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createContentUid(body: ContentUidRequest): Promise<ContentUidResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { createContentUid } = useContentUidsApi();
      const response = await createContentUid(body);
      
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

  async function updateContentUid(uid: string, body: ContentUidUpdateRequest): Promise<ContentUidResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { updateContentUid } = useContentUidsApi();
      const response = await updateContentUid(uid, body);
      
      // Update in items array
      const index = items.value.findIndex(item => item.uid === uid);
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

  async function deleteContentUid(uid: string): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const { deleteContentUid } = useContentUidsApi();
      await deleteContentUid(uid);
      
      // Remove from items array
      const index = items.value.findIndex(item => item.uid === uid);
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
    getContentUids,
    getSingleContentUid,
    createContentUid,
    updateContentUid,
    deleteContentUid,
  };
}); 