import type { 
  TopicResource, 
  TopicRequest, 
  TopicUpdateRequest,
  TopicResponse,
  SingleTopicResponse 
} from '~/types/topics'
import type { TopicFilterParams, EntityParams } from '~/types/api'

export const useTopicsApi = () => {
  const crudMixin = useCrudMixin<
    TopicResource,
    TopicRequest,
    TopicUpdateRequest,
    TopicResponse,
    SingleTopicResponse,
    TopicFilterParams
  >('topics', ['name', 'description'])

  // Специальная версия getTopics с Supabase для дополнительной фильтрации
  const getTopics = async (params?: EntityParams<TopicFilterParams>): Promise<TopicResponse> => {
    try {
      let query = crudMixin.baseApi.buildSupabaseQuery(params)
      
      // Применяем поиск
      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
      }

      // Применяем фильтры
      if (params?.filters?.language_id) {
        query = query.eq('language_id', params.filters.language_id)
      }

      // Сортировка по умолчанию по name
      if (!params?.sort_field) {
        query = query.order('name', { ascending: true })
      }

      const { data, error, count } = await query

      if (error) {
        crudMixin.baseApi.handleError(error, 'fetching topics')
      }

      return crudMixin.baseApi.formatResponse(
        (data || []) as unknown as TopicResource[], 
        count || 0, 
        params
      ) as TopicResponse
    } catch (error) {
      crudMixin.baseApi.handleError(error, 'fetching topics')
      throw error
    }
  }

  return {
    getTopics,
    getSingleTopic: crudMixin.getSingleItem,
    createTopic: crudMixin.createItem,
    updateTopic: crudMixin.updateItem,
    deleteTopic: crudMixin.deleteItem
  }
} 