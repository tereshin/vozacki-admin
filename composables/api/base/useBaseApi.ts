import type { EntityParams, BaseResponse } from '~/types/api'
import { DEFAULT_PAGE_SIZE } from '../config/apiConfig'

export const useBaseApi = <
  TResource = any,
  TParams = any
>(tableName: string) => {
  const { authenticatedFetch } = useAuthenticatedFetch()
  const supabase = useSupabase()
  const { handleError } = useApiErrorHandler()

  const buildApiUrl = (endpoint?: string): string => {
    const base = `/api/${tableName}`
    return endpoint ? `${base}/${endpoint}` : base
  }

  const buildSupabaseQuery = (params?: EntityParams<TParams>) => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }

    let query = supabase
      .from(tableName as any)
      .select('*', { count: 'exact' })

    // Применяем пагинацию
    if (params?.page && params?.per_page) {
      const from = (params.page - 1) * params.per_page
      const to = from + params.per_page - 1
      query = query.range(from, to)
    }

    // Применяем сортировку
    if (params?.sort_field) {
      query = query.order(params.sort_field, { 
        ascending: params.sort_order === 'asc' 
      })
    } else {
      // По умолчанию сортируем по created_at desc
      query = query.order('created_at', { ascending: false })
    }

    return query
  }

  const formatResponse = <T = TResource>(
    data: T[], 
    count: number, 
    params?: EntityParams<TParams>
  ): BaseResponse<T> => {
    const page = params?.page || 1
    const perPage = params?.per_page || DEFAULT_PAGE_SIZE
    const from = (page - 1) * perPage

    return {
      data: {
        collection: data,
        meta: {
          current_page: page,
          from: from + 1,
          last_page: Math.ceil(count / perPage),
          per_page: perPage,
          to: Math.min(from + perPage, count),
          total: count
        }
      }
    }
  }

  const applySearchFilter = (
    query: any,
    searchFields: string[],
    searchTerm?: string
  ) => {
    if (searchTerm && searchFields.length > 0) {
      const searchConditions = searchFields.map(field => 
        `${field}.ilike.%${searchTerm}%`
      ).join(',')
      return query.or(searchConditions)
    }
    return query
  }

  const safeSupabaseCall = async <T>(
    operation: () => Promise<{ data: T | null; error: any; count?: number | null }>,
    context: string
  ) => {
    try {
      const result = await operation()
      if (result.error) {
        handleError(result.error, context)
      }
      return result
    } catch (error) {
      handleError(error, context)
    }
  }

  return {
    buildApiUrl,
    buildSupabaseQuery,
    formatResponse,
    applySearchFilter,
    safeSupabaseCall,
    authenticatedFetch,
    supabase,
    handleError
  }
} 