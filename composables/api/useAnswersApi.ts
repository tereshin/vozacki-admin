import type { 
  AnswerResource, 
  AnswerRequest, 
  AnswerUpdateRequest,
  AnswerResponse,
  SingleAnswerResponse 
} from '~/types/answers'
import type { EntityParams } from '~/types/api'

interface AnswerFilterParams {
  language_id?: string;
  question_uid?: string;
}

export const useAnswersApi = () => {
  const supabase = useSupabase()
  const { handleError } = useApiErrorHandler()
  const crudMixin = useCrudMixin<
    AnswerResource,
    AnswerRequest,
    AnswerUpdateRequest,
    AnswerResponse,
    SingleAnswerResponse,
    AnswerFilterParams
  >('answers', ['text'])

  // Специальная версия getAnswers с дополнительной фильтрацией
  const getAnswers = async (params?: EntityParams<AnswerFilterParams>): Promise<AnswerResponse> => {
    try {
      let query = crudMixin.baseApi.buildSupabaseQuery(params)

      // Применяем поиск по тексту
      if (params?.search) {
        query = query.ilike('text', `%${params.search}%`)
      }

      // Применяем фильтры
      if (params?.filters?.language_id) {
        query = query.eq('language_id', params.filters.language_id)
      }

      if (params?.filters?.question_uid) {
        query = query.eq('question_uid', params.filters.question_uid)
      }

      // Сортировка по умолчанию
      if (!params?.sort_field) {
        query = query.order('created_at', { ascending: true })
      }

      const { data, error, count } = await query

      if (error) {
        handleError(error, 'fetching answers')
      }

      return crudMixin.baseApi.formatResponse(
        (data || []) as unknown as AnswerResource[], 
        count || 0, 
        params
      ) as AnswerResponse
    } catch (error) {
      handleError(error, 'fetching answers')
      throw error
    }
  }

  return {
    getAnswers,
    getSingleAnswer: crudMixin.getSingleItem,
    createAnswer: crudMixin.createItem,
    updateAnswer: crudMixin.updateItem,
    deleteAnswer: crudMixin.deleteItem
  }
} 