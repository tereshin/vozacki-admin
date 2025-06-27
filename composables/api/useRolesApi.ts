import type { 
  RoleResource, 
  RoleResponse,
} from '~/types/administrators'
import type { BaseApiParams } from '~/types/api'

export const useRolesApi = () => {
  const { authenticatedFetch } = useAuthenticatedFetch()
  const { handleError } = useApiErrorHandler()

  const getRoles = async (params?: BaseApiParams): Promise<RoleResponse> => {
    try {
      return await authenticatedFetch<RoleResponse>('/api/roles', {
        query: params
      })
    } catch (error) {
      handleError(error, 'fetching roles')
      throw error
    }
  }

  const getAllRoles = async (): Promise<RoleResource[]> => {
    try {
      const { data } = await authenticatedFetch<{ data: RoleResource[] }>('/api/roles/all')
      return data
    } catch (error) {
      handleError(error, 'fetching all roles')
      throw error
    }
  }

  return {
    getRoles,
    getAllRoles
  }
} 