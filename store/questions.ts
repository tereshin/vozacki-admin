import { defineStore } from "pinia";
import type { MetaResponse } from "~/types/general";
import type { QuestionResource, QuestionResponse, QuestionRequest, QuestionUpdateRequest } from "~/types/questions";

export const useQuestionsStore = defineStore("questions", () => {
  // State
  const items = ref<QuestionResource[]>([]);
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
  async function getQuestions(payload?: any): Promise<QuestionResponse> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getQuestions } = useQuestionsApi();
      const response = await getQuestions(payload);
      
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

  async function getSingleQuestion(id: string): Promise<QuestionResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getSingleQuestion } = useQuestionsApi();
      const response = await getSingleQuestion(id);
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createQuestion(body: QuestionRequest): Promise<QuestionResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { createQuestion } = useQuestionsApi();
      const response = await createQuestion(body);
      
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

  async function updateQuestion(id: string, body: QuestionUpdateRequest): Promise<QuestionResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { updateQuestion } = useQuestionsApi();
      const response = await updateQuestion(id, body);
      
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

  async function deleteQuestion(id: string): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const { deleteQuestion } = useQuestionsApi();
      await deleteQuestion(id);
      
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
    getQuestions,
    getSingleQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
}); 