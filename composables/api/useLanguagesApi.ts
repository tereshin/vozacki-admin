import type { 
  LanguageResource, 
  LanguageRequest, 
  LanguageUpdateRequest,
  LanguageResponse,
  SingleLanguageResponse 
} from '~/types/languages'
import type { EntityParams } from '~/types/api'

interface LanguageFilterParams {
  is_active?: boolean;
}

export const useLanguagesApi = () => {
  const supabase = useSupabase()
  const { handleError } = useApiErrorHandler()
  const crudMixin = useCrudMixin<
    LanguageResource,
    LanguageRequest,
    LanguageUpdateRequest,
    LanguageResponse,
    SingleLanguageResponse,
    LanguageFilterParams
  >('languages', ['name', 'code'])

  // Специальная версия getLanguages с дополнительной фильтрацией
  const getLanguages = async (params?: EntityParams<LanguageFilterParams>): Promise<LanguageResponse> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized')
      }

      let query = crudMixin.baseApi.buildSupabaseQuery(params)

      // Применяем поиск
      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,code.ilike.%${params.search}%`)
      }

      // Применяем фильтр активности
      if (params?.filters?.is_active !== undefined) {
        query = query.eq('is_active', params.filters.is_active)
      }

      // Сортировка по имени
      if (!params?.sort_field) {
        query = query.order('name', { ascending: true })
      }

      const { data, error, count } = await query

      if (error) {
        handleError(error, 'fetching languages')
      }

      return crudMixin.baseApi.formatResponse(
        (data || []) as unknown as LanguageResource[], 
        count || 0, 
        params
      ) as LanguageResponse
    } catch (error) {
      handleError(error, 'fetching languages')
      throw error
    }
  }

  return {
    getLanguages,
    getSingleLanguage: crudMixin.getSingleItem,
    createLanguage: crudMixin.createItem,
    updateLanguage: crudMixin.updateItem,
    deleteLanguage: crudMixin.deleteItem
  }
} 