import type { 
  ContentUidResource, 
  ContentUidRequest, 
  ContentUidUpdateRequest,
  ContentUidResponse,
  SingleContentUidResponse 
} from '~/types/content-uids'

export const useContentUidsApi = () => {
  const supabase = useSupabase()

  const getContentUids = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    content_type?: string;
  }): Promise<ContentUidResponse> => {
    try {
      let query = supabase
        .from('content_uids')
        .select('*', { count: 'exact' })

      if (params?.search) {
        query = query.or(`uid.ilike.%${params.search}%,content_type.ilike.%${params.search}%`)
      }

      if (params?.content_type) {
        query = query.eq('content_type', params.content_type)
      }

      const page = params?.page || 1
      const perPage = params?.per_page || 10
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      query = query.range(from, to).order('content_type', { ascending: true })

      const { data, error, count } = await query

      if (error) throw error

      const collection = (data || []) as ContentUidResource[]

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
      console.error('Error fetching content_uids:', error)
      throw error
    }
  }

  const getSingleContentUid = async (uid: string): Promise<SingleContentUidResponse> => {
    try {
      const { data, error } = await supabase
        .from('content_uids')
        .select('*')
        .eq('uid', uid)
        .single()

      if (error) throw error

      return {
        data: data as ContentUidResource
      }
    } catch (error) {
      console.error('Error fetching content_uid:', error)
      throw error
    }
  }

  const createContentUid = async (body: ContentUidRequest): Promise<SingleContentUidResponse> => {
    try {
      const { data, error } = await supabase
        .from('content_uids')
        .insert(body)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as ContentUidResource
      }
    } catch (error) {
      console.error('Error creating content_uid:', error)
      throw error
    }
  }

  const updateContentUid = async (uid: string, body: ContentUidUpdateRequest): Promise<SingleContentUidResponse> => {
    try {
      const { data, error } = await supabase
        .from('content_uids')
        .update(body)
        .eq('uid', uid)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as ContentUidResource
      }
    } catch (error) {
      console.error('Error updating content_uid:', error)
      throw error
    }
  }

  const deleteContentUid = async (uid: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('content_uids')
        .delete()
        .eq('uid', uid)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting content_uid:', error)
      throw error
    }
  }

  return {
    getContentUids,
    getSingleContentUid,
    createContentUid,
    updateContentUid,
    deleteContentUid
  }
} 