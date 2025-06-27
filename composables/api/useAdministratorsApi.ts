import type { 
  AdministratorResource, 
  AdministratorRequest, 
  AdministratorUpdateRequest,
  AdministratorResponse,
  SingleAdministratorResponse 
} from '~/types/administrators'

interface AdministratorFilterParams {
  role_id?: string;
}

export const useAdministratorsApi = () => {
  const { authenticatedFetch } = useAuthenticatedFetch()
  const { handleError } = useApiErrorHandler()

  const getAdministrators = async (params?: AdministratorFilterParams & {
    page?: number;
    per_page?: number;
    search?: string;
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<AdministratorResponse> => {
    try {
      return await authenticatedFetch<AdministratorResponse>('/api/administrators', {
        query: params
      })
    } catch (error) {
      handleError(error, 'fetching administrators')
      throw error
    }
  }

  const getSingleAdministrator = async (id: string): Promise<SingleAdministratorResponse> => {
    try {
      const { data } = await authenticatedFetch<SingleAdministratorResponse>(`/api/administrators/${id}`)
      return { data }
    } catch (error) {
      handleError(error, 'fetching administrator')
      throw error
    }
  }

  const createAdministrator = async (body: AdministratorRequest): Promise<SingleAdministratorResponse> => {
    try {
      const { data } = await authenticatedFetch<SingleAdministratorResponse>('/api/administrators', {
        method: 'POST',
        body
      })
      return { data }
    } catch (error) {
      handleError(error, 'creating administrator')
      throw error
    }
  }

  const updateAdministrator = async (id: string, body: AdministratorUpdateRequest): Promise<SingleAdministratorResponse> => {
    try {
      const { data } = await authenticatedFetch<SingleAdministratorResponse>(`/api/administrators/${id}`, {
        method: 'PUT',
        body
      })
      return { data }
    } catch (error) {
      handleError(error, 'updating administrator')
      throw error
    }
  }

  const deleteAdministrator = async (id: string): Promise<void> => {
    try {
      await authenticatedFetch(`/api/administrators/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      handleError(error, 'deleting administrator')
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