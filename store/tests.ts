import { defineStore } from "pinia";
import type { MetaResponse } from "~/types/general";
import type { TestResource, TestResponse, TestRequest, TestUpdateRequest } from "~/types/tests";

export const useTestsStore = defineStore("tests", () => {
  // State
  const items = ref<TestResource[]>([]);
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
  async function getTests(payload?: any): Promise<TestResponse> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getTests } = useTestsApi();
      const response = await getTests(payload);
      
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

  async function getSingleTest(id: string, language_id: string): Promise<TestResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getSingleTest } = useTestsApi();
      const response = await getSingleTest(id, language_id);
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createTest(body: TestRequest): Promise<TestResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { createTest } = useTestsApi();
      const response = await createTest(body);
      
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

  async function updateTest(id: string, body: TestUpdateRequest): Promise<TestResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { updateTest } = useTestsApi();
      const response = await updateTest(id, body);
      
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

  async function deleteTest(id: string): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const { deleteTest } = useTestsApi();
      await deleteTest(id);
      
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
    getTests,
    getSingleTest,
    createTest,
    updateTest,
    deleteTest,
  };
}); 