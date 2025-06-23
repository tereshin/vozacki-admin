import type { 
  RoleResource, 
  RoleResponse,
} from '~/types/administrators'

export const useRolesApi = () => {
  const { authenticatedFetch } = useAuthenticatedFetch()

  const getRoles = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<RoleResponse> => {
    try {
      const query = new URLSearchParams()
      
      if (params?.page) query.append('page', params.page.toString())
      if (params?.per_page) query.append('per_page', params.per_page.toString())
      if (params?.search) query.append('search', params.search)
      if (params?.sort_field) query.append('sort_field', params.sort_field)
      if (params?.sort_order) query.append('sort_order', params.sort_order)

      const response = await authenticatedFetch<RoleResponse>(`/api/roles?${query.toString()}`)
      
      return response
    } catch (error) {
      console.error('Error fetching roles:', error)
      throw error
    }
  }

  const getAllRoles = async (): Promise<RoleResource[]> => {
    try {
      const { data } = await authenticatedFetch<{ data: RoleResource[] }>('/api/roles/all')
      
      return data
    } catch (error) {
      console.error('Error fetching all roles:', error)
      throw error
    }
  }

  return {
    getRoles,
    getAllRoles
  }
} 