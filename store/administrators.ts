import { defineStore } from "pinia";
import type { MetaResponse } from "~/types/general";
import type { AdministratorResource, AdministratorResponse, AdministratorRequest, AdministratorUpdateRequest } from "~/types/administrators";

export const useAdministratorsStore = defineStore("administrators", () => {
  // State
  const items = ref<AdministratorResource[]>([]);
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
  async function getAdministrators(payload?: any): Promise<AdministratorResponse> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getAdministrators } = useAdministratorsApi();
      const response = await getAdministrators(payload);
      
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

  async function getSingleAdministrator(id: string): Promise<AdministratorResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { getSingleAdministrator } = useAdministratorsApi();
      const response = await getSingleAdministrator(id);
      
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createAdministrator(body: AdministratorRequest): Promise<AdministratorResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { createAdministrator } = useAdministratorsApi();
      const response = await createAdministrator(body);
      
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

  async function updateAdministrator(id: string, body: AdministratorUpdateRequest): Promise<AdministratorResource> {
    loading.value = true;
    error.value = null;
    
    try {
      const { updateAdministrator } = useAdministratorsApi();
      const response = await updateAdministrator(id, body);
      
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

  async function deleteAdministrator(id: string): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      const { deleteAdministrator } = useAdministratorsApi();
      await deleteAdministrator(id);
      
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
    getAdministrators,
    getSingleAdministrator,
    createAdministrator,
    updateAdministrator,
    deleteAdministrator,
  };
}); 