import type { 
  TopicResource, 
  TopicRequest, 
  TopicUpdateRequest,
  TopicResponse,
  SingleTopicResponse 
} from '~/types/topics'

export const useTopicsApi = () => {
  const { authenticatedFetch } = useAuthenticatedFetch()

  const getTopics = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    language_id?: string;
  }): Promise<TopicResponse> => {
    try {
      return await authenticatedFetch('/api/topics', {
        method: 'GET',
        query: params
      })
    } catch (error) {
      console.error('Error fetching topics:', error)
      throw error
    }
  }

  const getSingleTopic = async (id: string): Promise<SingleTopicResponse> => {
    try {
      return await authenticatedFetch(`/api/topics/${id}`, {
        method: 'GET'
      })
    } catch (error) {
      console.error('Error fetching topic:', error)
      throw error
    }
  }

  const createTopic = async (body: TopicRequest): Promise<SingleTopicResponse> => {
    try {
      return await authenticatedFetch('/api/topics', {
        method: 'POST',
        body
      })
    } catch (error) {
      console.error('Error creating topic:', error)
      throw error
    }
  }

  const updateTopic = async (id: string, body: TopicUpdateRequest): Promise<SingleTopicResponse> => {
    try {
      return await authenticatedFetch(`/api/topics/${id}`, {
        method: 'PUT',
        body
      })
    } catch (error) {
      console.error('Error updating topic:', error)
      throw error
    }
  }

  const deleteTopic = async (id: string): Promise<void> => {
    try {
      await authenticatedFetch(`/api/topics/${id}`, {
        method: 'DELETE'
      })
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