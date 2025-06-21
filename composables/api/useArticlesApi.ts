import type { 
  ArticleResource, 
  ArticleRequest, 
  ArticleUpdateRequest,
  ArticleResponse,
  SingleArticleResponse 
} from '~/types/articles'

export const useArticlesApi = () => {
  const supabase = useSupabase()

  const getArticles = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    language_id?: string;
    category_uid?: string;
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<ArticleResponse> => {
    try {
      let query = supabase
        .from('articles')
        .select('*', { count: 'exact' })

      if (params?.search) {
        query = query.or(`title.ilike.%${params.search}%,slug.ilike.%${params.search}%`)
      }

      if (params?.language_id) {
        query = query.eq('language_id', params.language_id)
      }

      if (params?.category_uid) {
        query = query.eq('category_uid', params.category_uid)
      }

      const page = params?.page || 1
      const perPage = params?.per_page || 10
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      // Сортировка
      const sortField = params?.sort_field || 'published_at'
      const sortOrder = params?.sort_order || 'desc'
      const ascending = sortOrder === 'asc'
      
      query = query.range(from, to).order(sortField, { 
        ascending, 
        nullsFirst: sortField === 'published_at' ? false : true 
      })

      const { data, error, count } = await query

      if (error) throw error

      const collection = (data || []) as ArticleResource[]

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
      console.error('Error fetching articles:', error)
      throw error
    }
  }

  const getSingleArticle = async (id: string): Promise<SingleArticleResponse> => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data: data as ArticleResource
      }
    } catch (error) {
      console.error('Error fetching article:', error)
      throw error
    }
  }

  const createArticle = async (body: ArticleRequest): Promise<SingleArticleResponse> => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert(body)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as ArticleResource
      }
    } catch (error) {
      console.error('Error creating article:', error)
      throw error
    }
  }

  const updateArticle = async (id: string, body: ArticleUpdateRequest): Promise<SingleArticleResponse> => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update(body)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as ArticleResource
      }
    } catch (error) {
      console.error('Error updating article:', error)
      throw error
    }
  }

  const deleteArticle = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting article:', error)
      throw error
    }
  }

  return {
    getArticles,
    getSingleArticle,
    createArticle,
    updateArticle,
    deleteArticle
  }
} 