import type { 
  LanguageResource, 
  LanguageRequest, 
  LanguageUpdateRequest,
  LanguageResponse,
  SingleLanguageResponse 
} from '~/types/languages'
import type { Tables } from '~/types/database'

export const useLanguagesApi = () => {
  let supabase: any = null
  
  try {
    supabase = useSupabase()
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    throw new Error('Supabase client initialization failed')
  }

  const getLanguages = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<LanguageResponse> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized')
      }

      let query = supabase
        .from('languages')
        .select('*', { count: 'exact' })

      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,code.ilike.%${params.search}%`)
      }

      if (params?.is_active !== undefined) {
        query = query.eq('is_active', params.is_active)
      }

      const page = params?.page || 1
      const perPage = params?.per_page || 10
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      query = query.range(from, to).order('name', { ascending: true })

      const { data, error, count } = await query

      if (error) throw error

      const collection = (data || []) as LanguageResource[]

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
      console.error('Error fetching languages:', error)
      throw error
    }
  }

  const getSingleLanguage = async (id: string): Promise<SingleLanguageResponse> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized')
      }

      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data: data as LanguageResource
      }
    } catch (error) {
      console.error('Error fetching language:', error)
      throw error
    }
  }

  const createLanguage = async (body: LanguageRequest): Promise<SingleLanguageResponse> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized')
      }

      const { data, error } = await supabase
        .from('languages')
        .insert(body)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as LanguageResource
      }
    } catch (error) {
      console.error('Error creating language:', error)
      throw error
    }
  }

  const updateLanguage = async (id: string, body: LanguageUpdateRequest): Promise<SingleLanguageResponse> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized')
      }

      const { data, error } = await supabase
        .from('languages')
        .update(body)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as LanguageResource
      }
    } catch (error) {
      console.error('Error updating language:', error)
      throw error
    }
  }

  const deleteLanguage = async (id: string): Promise<void> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized')
      }

      const { error } = await supabase
        .from('languages')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting language:', error)
      throw error
    }
  }

  return {
    getLanguages,
    getSingleLanguage,
    createLanguage,
    updateLanguage,
    deleteLanguage
  }
} 