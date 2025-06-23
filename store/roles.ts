import { defineStore } from "pinia";
import type { MetaResponse } from "~/types/general";
import type { RoleResource, RoleResponse } from "~/types/administrators";
import { useCacheManager } from "~/composables/cache/useCacheManager";

export const useRolesStore = defineStore("roles", () => {
  // Cache utilities
  const { getCachedRoles } = useCacheManager();
  
  // State
  const items = ref<RoleResource[]>([]);
  const allRoles = ref<RoleResource[]>([]);
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
  async function getRoles(payload?: any): Promise<RoleResponse> {
    loading.value = true;
    error.value = null;
    
    try {
      // Получаем все роли из кэша
      const cachedRoles = await getCachedRoles();
      let filteredRoles = cachedRoles;
      
      // Применяем фильтры если payload предоставлен
      if (payload) {
        if (payload.search) {
          const searchLower = payload.search.toLowerCase();
          filteredRoles = filteredRoles.filter(role => 
            role.name.toLowerCase().includes(searchLower) || 
            role.code.toLowerCase().includes(searchLower)
          );
        }
      }
      
      // Применяем пагинацию
      const page = payload?.page || 1;
      const perPage = payload?.per_page || 10;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedItems = filteredRoles.slice(startIndex, endIndex);
      
      items.value = paginatedItems;
      meta.value = {
        current_page: page,
        from: startIndex + 1,
        last_page: Math.ceil(filteredRoles.length / perPage),
        per_page: perPage,
        to: Math.min(endIndex, filteredRoles.length),
        total: filteredRoles.length
      };
      
      return {
        data: {
          collection: paginatedItems,
          meta: meta.value
        }
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getAllRoles(): Promise<RoleResource[]> {
    loading.value = true;
    error.value = null;
    
    try {
      // Получаем все роли из кэша
      const roles = await getCachedRoles();
      allRoles.value = roles;
      
      return roles;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    items,
    allRoles,
    meta,
    loading,
    error,
    getRoles,
    getAllRoles,
  };
}); 