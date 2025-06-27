import type { 
  TestResource, 
  TestRequest, 
  TestUpdateRequest,
  TestResponse,
  SingleTestResponse 
} from '~/types/tests'
import type { TestFilterParams, EntityParams } from '~/types/api'

export const useTestsApi = () => {
  const crudMixin = useCrudMixin<
    TestResource,
    TestRequest,
    TestUpdateRequest,
    TestResponse,
    SingleTestResponse,
    TestFilterParams
  >('tests', ['title', 'description'])

  // Специальная версия getTests с Supabase для дополнительной фильтрации
  const getTests = async (params?: EntityParams<TestFilterParams>): Promise<TestResponse> => {
    try {
      let query = crudMixin.baseApi.buildSupabaseQuery(params)
      
      // Применяем поиск
      if (params?.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
      }

      // Применяем фильтры
      if (params?.filters?.language_id) {
        query = query.eq('language_id', params.filters.language_id)
      }

      if (params?.filters?.topic_uid) {
        query = query.eq('topic_uid', params.filters.topic_uid)
      }

      // Сортировка по умолчанию по title
      if (!params?.sort_field) {
        query = query.order('title', { ascending: true })
      }

      const { data, error, count } = await query

      if (error) {
        crudMixin.baseApi.handleError(error, 'fetching tests')
      }

      return crudMixin.baseApi.formatResponse(
        (data || []) as unknown as TestResource[], 
        count || 0, 
        params
      ) as TestResponse
    } catch (error) {
      crudMixin.baseApi.handleError(error, 'fetching tests')
      throw error
    }
  }

  return {
    getTests,
    getSingleTest: crudMixin.getSingleItem,
    createTest: crudMixin.createItem,
    updateTest: crudMixin.updateItem,
    deleteTest: crudMixin.deleteItem
  }
} 