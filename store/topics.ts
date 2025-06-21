import { defineStore } from "pinia";
import type { MetaResponse } from "~/types/general";
import type { TopicResource, TopicResponse, TopicRequest, TopicUpdateRequest } from "~/types/topics";

export const useTopicsStore = defineStore("topics", () => {
  // State
  const items = ref<TopicResource[]>([]);
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
  async function getTopics(payload?: any): Promise<TopicResponse> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getTopics } = useTopicsApi();
      const response = await getTopics(payload);
      
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

  async function getSingleTopic(id: string): Promise<TopicResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getSingleTopic } = useTopicsApi();
      const response = await getSingleTopic(id);
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createTopic(body: TopicRequest): Promise<TopicResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { createTopic } = useTopicsApi();
      const response = await createTopic(body);
      
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

  async function updateTopic(id: string, body: TopicUpdateRequest): Promise<TopicResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { updateTopic } = useTopicsApi();
      const response = await updateTopic(id, body);
      
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

  async function deleteTopic(id: string): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const { deleteTopic } = useTopicsApi();
      await deleteTopic(id);
      
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
    getTopics,
    getSingleTopic,
    createTopic,
    updateTopic,
    deleteTopic,
  };
}); 