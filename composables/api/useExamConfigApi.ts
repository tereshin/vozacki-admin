import type { 
  ExamConfigResource, 
  ExamConfigRequest, 
  ExamConfigUpdateRequest,
  ExamConfigResponse,
  SingleExamConfigResponse 
} from '~/types/exam-config'

export const useExamConfigApi = () => {
  const supabase = useSupabase()

  const getExamConfigs = async (params?: {
    page?: number;
    per_page?: number;
  }): Promise<ExamConfigResponse> => {
    try {
      let query = supabase
        .from('exam_config')
        .select('*', { count: 'exact' })

      const page = params?.page || 1
      const perPage = params?.per_page || 10
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      query = query.range(from, to).order('id', { ascending: true })

      const { data, error, count } = await query

      if (error) throw error

      const collection = (data || []) as ExamConfigResource[]

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
      console.error('Error fetching exam_configs:', error)
      throw error
    }
  }

  const getSingleExamConfig = async (id: number): Promise<SingleExamConfigResponse> => {
    try {
      const { data, error } = await supabase
        .from('exam_config')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data: data as ExamConfigResource
      }
    } catch (error) {
      console.error('Error fetching exam_config:', error)
      throw error
    }
  }

  const createExamConfig = async (body: ExamConfigRequest): Promise<SingleExamConfigResponse> => {
    try {
      const { data, error } = await supabase
        .from('exam_config')
        .insert(body)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as ExamConfigResource
      }
    } catch (error) {
      console.error('Error creating exam_config:', error)
      throw error
    }
  }

  const updateExamConfig = async (id: number, body: ExamConfigUpdateRequest): Promise<SingleExamConfigResponse> => {
    try {
      const { data, error } = await supabase
        .from('exam_config')
        .update(body)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as ExamConfigResource
      }
    } catch (error) {
      console.error('Error updating exam_config:', error)
      throw error
    }
  }

  const deleteExamConfig = async (id: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from('exam_config')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting exam_config:', error)
      throw error
    }
  }

  return {
    getExamConfigs,
    getSingleExamConfig,
    createExamConfig,
    updateExamConfig,
    deleteExamConfig
  }
} 