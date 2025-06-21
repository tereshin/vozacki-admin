import type { 
  TopicResource, 
  TopicRequest, 
  TopicUpdateRequest,
  TopicResponse,
  SingleTopicResponse 
} from '~/types/topics'

export const useTopicsApi = () => {
  const supabase = useSupabase()

  const getTopics = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    language_id?: string;
  }): Promise<TopicResponse> => {
    try {
      let query = supabase
        .from('topics')
        .select('*', { count: 'exact' })

      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
      }

      if (params?.language_id) {
        query = query.eq('language_id', params.language_id)
      }

      const page = params?.page || 1
      const perPage = params?.per_page || 10
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      query = query.range(from, to).order('name', { ascending: true })

      const { data, error, count } = await query

      if (error) throw error

      const collection = (data || []) as TopicResource[]

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
      console.error('Error fetching topics:', error)
      throw error
    }
  }

  const getSingleTopic = async (id: string): Promise<SingleTopicResponse> => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data: data as TopicResource
      }
    } catch (error) {
      console.error('Error fetching topic:', error)
      throw error
    }
  }

  const createTopic = async (body: TopicRequest): Promise<SingleTopicResponse> => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .insert(body)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as TopicResource
      }
    } catch (error) {
      console.error('Error creating topic:', error)
      throw error
    }
  }

  const updateTopic = async (id: string, body: TopicUpdateRequest): Promise<SingleTopicResponse> => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .update(body)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as TopicResource
      }
    } catch (error) {
      console.error('Error updating topic:', error)
      throw error
    }
  }

  const deleteTopic = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting topic:', error)
      throw error
    }
  }

  return {
    getTopics,
    getSingleTopic,
    createTopic,
    updateTopic,
    deleteTopic
  }
} 