import type { 
  TestResource, 
  TestRequest, 
  TestUpdateRequest,
  TestResponse,
  SingleTestResponse 
} from '~/types/tests'

export const useTestsApi = () => {
  const supabase = useSupabase()

  const getTests = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    language_id?: string;
    topic_uid?: string;
  }): Promise<TestResponse> => {
    try {
      let query = supabase
        .from('tests')
        .select('*', { count: 'exact' })

      if (params?.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
      }

      if (params?.language_id) {
        query = query.eq('language_id', params.language_id)
      }

      if (params?.topic_uid) {
        query = query.eq('topic_uid', params.topic_uid)
      }

      const page = params?.page || 1
      const perPage = params?.per_page || 10
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      query = query.range(from, to).order('title', { ascending: true })

      const { data, error, count } = await query

      if (error) throw error

      const collection = (data || []) as TestResource[]

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
      console.error('Error fetching tests:', error)
      throw error
    }
  }

  const getSingleTest = async (id: string, language_id: string): Promise<SingleTestResponse> => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('uid', id)
        .eq('language_id', language_id)
        .single()

      if (error) throw error

      return {
        data: data as TestResource
      }
    } catch (error) {
      console.error('Error fetching test:', error)
      throw error
    }
  }

  const createTest = async (body: TestRequest): Promise<SingleTestResponse> => {
    try {
      const { authenticatedFetch } = useAuthenticatedFetch()
      const { data } = await authenticatedFetch('/api/tests', {
        method: 'POST',
        body
      })

      return {
        data: data as TestResource
      }
    } catch (error) {
      console.error('Error creating test:', error)
      throw error
    }
  }

  const updateTest = async (id: string, body: TestUpdateRequest): Promise<SingleTestResponse> => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .update(body)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as TestResource
      }
    } catch (error) {
      console.error('Error updating test:', error)
      throw error
    }
  }

  const deleteTest = async (id: string): Promise<void> => {
    try {
      // First, get the test to retrieve its UID
      const { data: testData, error: getError } = await supabase
        .from('tests')
        .select('uid')
        .eq('id', id)
        .single()

      if (getError) throw getError

      // Delete the test
      const { error: deleteError } = await supabase
        .from('tests')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Delete the content_uid entry
      if (testData?.uid) {
        const { error: contentUidError } = await supabase
          .from('content_uids')
          .delete()
          .eq('uid', testData.uid)

        if (contentUidError) {
          console.warn('Error deleting content_uid:', contentUidError)
          // Don't throw here as the main record is already deleted
        }
      }
    } catch (error) {
      console.error('Error deleting test:', error)
      throw error
    }
  }

  return {
    getTests,
    getSingleTest,
    createTest,
    updateTest,
    deleteTest
  }
} 