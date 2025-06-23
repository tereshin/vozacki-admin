import { defineStore } from "pinia";
import type { MetaResponse } from "~/types/general";
import type { ExamConfigResource, ExamConfigResponse, ExamConfigRequest, ExamConfigUpdateRequest } from "~/types/exam-config";

export const useExamConfigStore = defineStore("exam-config", () => {
  // State
  const items = ref<ExamConfigResource[]>([]);
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
  async function getExamConfigs(payload?: any): Promise<ExamConfigResponse> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getExamConfigs } = useExamConfigApi();
      const response = await getExamConfigs(payload);
      
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

  async function getSingleExamConfig(id: number): Promise<ExamConfigResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getSingleExamConfig } = useExamConfigApi();
      const response = await getSingleExamConfig(id);
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createExamConfig(body: ExamConfigRequest): Promise<ExamConfigResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { createExamConfig } = useExamConfigApi();
      const response = await createExamConfig(body);
      
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

  async function updateExamConfig(id: number, body: ExamConfigUpdateRequest): Promise<ExamConfigResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { updateExamConfig } = useExamConfigApi();
      const response = await updateExamConfig(id, body);
      
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

  async function deleteExamConfig(id: number): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const { deleteExamConfig } = useExamConfigApi();
      await deleteExamConfig(id);
      
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
    getExamConfigs,
    getSingleExamConfig,
    createExamConfig,
    updateExamConfig,
    deleteExamConfig,
  };
}); 