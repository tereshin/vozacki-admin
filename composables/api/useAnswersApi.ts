import type { 
  AnswerResource, 
  AnswerRequest, 
  AnswerUpdateRequest,
  AnswerResponse,
  SingleAnswerResponse 
} from '~/types/answers'

export const useAnswersApi = () => {
  const supabase = useSupabase()

  const getAnswers = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    language_id?: string;
    question_uid?: string;
    is_correct?: boolean;
  }): Promise<AnswerResponse> => {
    try {
      let query = supabase
        .from('answers')
        .select('*', { count: 'exact' })

      if (params?.search) {
        query = query.ilike('text', `%${params.search}%`)
      }

      if (params?.language_id) {
        query = query.eq('language_id', params.language_id)
      }

      if (params?.question_uid) {
        query = query.eq('question_uid', params.question_uid)
      }

      if (params?.is_correct !== undefined) {
        query = query.eq('is_correct', params.is_correct)
      }

      const page = params?.page || 1
      const perPage = params?.per_page || 10
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      query = query.range(from, to).order('external_id', { ascending: true })

      const { data, error, count } = await query

      if (error) throw error

      const collection = (data || []) as AnswerResource[]

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
      console.error('Error fetching answers:', error)
      throw error
    }
  }

  const getSingleAnswer = async (id: string): Promise<SingleAnswerResponse> => {
    try {
      const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data: data as AnswerResource
      }
    } catch (error) {
      console.error('Error fetching answer:', error)
      throw error
    }
  }

  const createAnswer = async (body: AnswerRequest): Promise<SingleAnswerResponse> => {
    try {
      const { authenticatedFetch } = useAuthenticatedFetch()
      const { data } = await authenticatedFetch('/api/answers', {
        method: 'POST',
        body
      })

      return {
        data: data as AnswerResource
      }
    } catch (error) {
      console.error('Error creating answer:', error)
      throw error
    }
  }

  const updateAnswer = async (id: string, body: AnswerUpdateRequest): Promise<SingleAnswerResponse> => {
    try {
      const { authenticatedFetch } = useAuthenticatedFetch()
      const { data } = await authenticatedFetch(`/api/answers/${id}`, {
        method: 'PUT',
        body
      })

      return {
        data: data as AnswerResource
      }
    } catch (error) {
      console.error('Error updating answer:', error)
      throw error
    }
  }

  const deleteAnswer = async (id: string): Promise<void> => {
    try {
      const { authenticatedFetch } = useAuthenticatedFetch()
      await authenticatedFetch(`/api/answers/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error deleting answer:', error)
      throw error
    }
  }

  return {
    getAnswers,
    getSingleAnswer,
    createAnswer,
    updateAnswer,
    deleteAnswer
  }
} 