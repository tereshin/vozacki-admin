import type { 
  AdministratorResource, 
  AdministratorRequest, 
  AdministratorUpdateRequest,
  AdministratorResponse,
  SingleAdministratorResponse 
} from '~/types/administrators'

export const useAdministratorsApi = () => {
  const getAdministrators = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    role_id?: string;
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<AdministratorResponse> => {
    try {
      const query = new URLSearchParams()
      
      if (params?.page) query.append('page', params.page.toString())
      if (params?.per_page) query.append('per_page', params.per_page.toString())
      if (params?.search) query.append('search', params.search)
      if (params?.role_id) query.append('role_id', params.role_id)
      if (params?.sort_field) query.append('sort_field', params.sort_field)
      if (params?.sort_order) query.append('sort_order', params.sort_order)

      const response = await $fetch<AdministratorResponse>(`/api/administrators?${query.toString()}`)
      
      return response
    } catch (error) {
      console.error('Error fetching administrators:', error)
      throw error
    }
  }

  const getSingleAdministrator = async (id: string): Promise<SingleAdministratorResponse> => {
    try {
      const { data } = await $fetch<SingleAdministratorResponse>(`/api/administrators/${id}`)
      
      return { data }
    } catch (error) {
      console.error('Error fetching administrator:', error)
      throw error
    }
  }

  const createAdministrator = async (body: AdministratorRequest): Promise<SingleAdministratorResponse> => {
    try {
      const { data } = await $fetch<SingleAdministratorResponse>('/api/administrators', {
        method: 'POST',
        body
      })
      
      return { data }
    } catch (error) {
      console.error('Error creating administrator:', error)
      throw error
    }
  }

  const updateAdministrator = async (id: string, body: AdministratorUpdateRequest): Promise<SingleAdministratorResponse> => {
    try {
      const { data } = await $fetch<SingleAdministratorResponse>(`/api/administrators/${id}`, {
        method: 'PUT',
        body
      })
      
      return { data }
    } catch (error) {
      console.error('Error updating administrator:', error)
      throw error
    }
  }

  const deleteAdministrator = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/administrators/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error deleting administrator:', error)
      throw error
    }
  }

  return {
    getAdministrators,
    getSingleAdministrator,
    createAdministrator,
    updateAdministrator,
    deleteAdministrator
  }
} 