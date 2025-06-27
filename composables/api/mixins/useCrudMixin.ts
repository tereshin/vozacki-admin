import type { EntityParams, BaseResponse, BaseSingleResponse } from '~/types/api'

export const useCrudMixin = <
  TResource,
  TRequest,
  TUpdateRequest,
  TResponse extends BaseResponse<TResource>,
  TSingleResponse extends BaseSingleResponse<TResource>,
  TParams = any
>(
  tableName: string, 
  searchFields: string[] = []
) => {
  const baseApi = useBaseApi<TResource, TParams>(tableName)

  const getItems = async (params?: EntityParams<TParams>): Promise<TResponse> => {
    try {
      // Предпочитаем API endpoint
      return await baseApi.authenticatedFetch<TResponse>(baseApi.buildApiUrl(), {
        query: params
      })
    } catch (error) {
      baseApi.handleError(error, `fetching ${tableName}`)
      throw error
    }
  }

    const getItemsWithSupabase = async (params?: EntityParams<TParams>): Promise<TResponse> => {
    try {
      let query = baseApi.buildSupabaseQuery(params)
      
      // Применяем поиск если есть поля для поиска
      if (params?.search && searchFields.length > 0) {
        query = baseApi.applySearchFilter(query, searchFields, params.search)
      }

      const { data, error, count } = await query

      if (error) {
        baseApi.handleError(error, `fetching ${tableName} with Supabase`)
      }

      const formattedResponse = baseApi.formatResponse(
        (data || []) as TResource[], 
        count || 0, 
        params
      )

      return formattedResponse as TResponse
    } catch (error) {
      baseApi.handleError(error, `fetching ${tableName} with Supabase`)
      throw error
    }
  }

  const getSingleItem = async (id: string): Promise<TSingleResponse> => {
    try {
      return await baseApi.authenticatedFetch<TSingleResponse>(baseApi.buildApiUrl(id))
    } catch (error) {
      baseApi.handleError(error, `fetching single ${tableName}`)
      throw error
    }
  }

  const createItem = async (body: TRequest): Promise<TSingleResponse> => {
    try {
      return await baseApi.authenticatedFetch<TSingleResponse>(baseApi.buildApiUrl(), {
        method: 'POST',
        body
      })
    } catch (error) {
      baseApi.handleError(error, `creating ${tableName}`)
      throw error
    }
  }

  const updateItem = async (id: string, body: TUpdateRequest): Promise<TSingleResponse> => {
    try {
      return await baseApi.authenticatedFetch<TSingleResponse>(baseApi.buildApiUrl(id), {
        method: 'PUT',
        body
      })
    } catch (error) {
      baseApi.handleError(error, `updating ${tableName}`)
      throw error
    }
  }

  const deleteItem = async (id: string): Promise<void> => {
    try {
      await baseApi.authenticatedFetch(baseApi.buildApiUrl(id), {
        method: 'DELETE'
      })
    } catch (error) {
      baseApi.handleError(error, `deleting ${tableName}`)
      throw error
    }
  }

  return {
    getItems,
    getItemsWithSupabase,
    getSingleItem,
    createItem,
    updateItem,
    deleteItem,
    baseApi
  }
} 