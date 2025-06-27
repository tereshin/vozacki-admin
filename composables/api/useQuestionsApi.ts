import type { 
  QuestionResource, 
  QuestionRequest, 
  QuestionUpdateRequest,
  QuestionResponse,
  SingleQuestionResponse 
} from '~/types/questions'
import type { EntityParams } from '~/types/api'

interface QuestionFilterParams {
  language_id?: string;
  test_uid?: string;
  points?: number;
}

export const useQuestionsApi = () => {
  const supabase = useSupabase()
  const { handleError } = useApiErrorHandler()
  const crudMixin = useCrudMixin<
    QuestionResource,
    QuestionRequest,
    QuestionUpdateRequest,
    QuestionResponse,
    SingleQuestionResponse,
    QuestionFilterParams
  >('questions', ['text'])

  // Специальная версия getQuestions с дополнительной фильтрацией
  const getQuestions = async (params?: EntityParams<QuestionFilterParams>): Promise<QuestionResponse> => {
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

      if (params?.filters?.test_uid) {
        query = query.eq('test_uid', params.filters.test_uid)
      }

      if (params?.filters?.points) {
        query = query.eq('points', params.filters.points)
      }

      // Сортировка по external_id
      if (!params?.sort_field) {
        query = query.order('external_id', { ascending: true })
      }

      const { data, error, count } = await query

      if (error) {
        handleError(error, 'fetching questions')
      }

      return crudMixin.baseApi.formatResponse(
        (data || []) as unknown as QuestionResource[], 
        count || 0, 
        params
      ) as QuestionResponse
    } catch (error) {
      handleError(error, 'fetching questions')
      throw error
    }
  }

  return {
    getQuestions,
    getSingleQuestion: crudMixin.getSingleItem,
    createQuestion: crudMixin.createItem,
    updateQuestion: crudMixin.updateItem,
    deleteQuestion: crudMixin.deleteItem
  }
} 