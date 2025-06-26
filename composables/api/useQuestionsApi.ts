import type { 
  QuestionResource, 
  QuestionRequest, 
  QuestionUpdateRequest,
  QuestionResponse,
  SingleQuestionResponse 
} from '~/types/questions'

export const useQuestionsApi = () => {
  const supabase = useSupabase()

  const getQuestions = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    language_id?: string;
    test_uid?: string;
  }): Promise<QuestionResponse> => {
    try {
      let query = supabase
        .from('questions')
        .select('*', { count: 'exact' })

      if (params?.search) {
        query = query.ilike('text', `%${params.search}%`)
      }

      if (params?.language_id) {
        query = query.eq('language_id', params.language_id)
      }

      if (params?.test_uid) {
        query = query.eq('test_uid', params.test_uid)
      }

      const page = params?.page || 1
      const perPage = params?.per_page || 10
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      query = query.range(from, to).order('external_id', { ascending: true })

      const { data, error, count } = await query

      if (error) throw error

      const collection = (data || []) as QuestionResource[]

      return {
        data: {
          collection,
          meta: {
            current_page: page,
            from: from + 1,
            last_page: Math.ceil((count || 0) / perPage),
            per_page: perPage,
            to: Math.min(to + 1, count || 0),
            total: count || 0
          }
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      throw error
    }
  }

  const getSingleQuestion = async (id: string): Promise<SingleQuestionResponse> => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data: data as QuestionResource
      }
    } catch (error) {
      console.error('Error fetching question:', error)
      throw error
    }
  }

  const createQuestion = async (body: QuestionRequest): Promise<SingleQuestionResponse> => {
    try {
      const { authenticatedFetch } = useAuthenticatedFetch()
      const { data } = await authenticatedFetch('/api/questions', {
        method: 'POST',
        body
      })

      return {
        data: data as QuestionResource
      }
    } catch (error) {
      console.error('Error creating question:', error)
      throw error
    }
  }

  const updateQuestion = async (id: string, body: QuestionUpdateRequest): Promise<SingleQuestionResponse> => {
    try {
      const { authenticatedFetch } = useAuthenticatedFetch()
      const { data } = await authenticatedFetch(`/api/questions/${id}`, {
        method: 'PUT',
        body
      })

      return {
        data: data as QuestionResource
      }
    } catch (error) {
      console.error('Error updating question:', error)
      throw error
    }
  }

  const deleteQuestion = async (id: string): Promise<void> => {
    try {
      const { authenticatedFetch } = useAuthenticatedFetch()
      await authenticatedFetch(`/api/questions/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  }

  return {
    getQuestions,
    getSingleQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion
  }
} 