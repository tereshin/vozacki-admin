import { defineStore } from "pinia";
import type { MetaResponse } from "~/types/general";
import type { AnswerResource, AnswerResponse, AnswerRequest, AnswerUpdateRequest } from "~/types/answers";

export const useAnswersStore = defineStore("answers", () => {
  // State
  const items = ref<AnswerResource[]>([]);
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
  async function getAnswers(payload?: any): Promise<AnswerResponse> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getAnswers } = useAnswersApi();
      const response = await getAnswers(payload);
      
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

  async function getSingleAnswer(id: string): Promise<AnswerResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getSingleAnswer } = useAnswersApi();
      const response = await getSingleAnswer(id);
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createAnswer(body: AnswerRequest): Promise<AnswerResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { createAnswer } = useAnswersApi();
      const response = await createAnswer(body);
      
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

  async function updateAnswer(id: string, body: AnswerUpdateRequest): Promise<AnswerResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { updateAnswer } = useAnswersApi();
      const response = await updateAnswer(id, body);
      
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

  async function deleteAnswer(id: string): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const { deleteAnswer } = useAnswersApi();
      await deleteAnswer(id);
      
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
    getAnswers,
    getSingleAnswer,
    createAnswer,
    updateAnswer,
    deleteAnswer,
  };
}); 