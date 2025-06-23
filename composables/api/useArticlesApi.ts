import type { 
  ArticleResource, 
  ArticleRequest, 
  ArticleUpdateRequest,
  ArticleResponse,
  SingleArticleResponse,
  EditorJSData 
} from '~/types/articles'

export const useArticlesApi = () => {
  const { authenticatedFetch } = useAuthenticatedFetch()

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
      const response = await authenticatedFetch<ArticleResponse>('/api/articles', {
        query: params
      })

      // Transform content for each article
      const transformedCollection = response.data.collection.map(item => ({
        ...item,
        content: item.content as unknown as EditorJSData
      })) as ArticleResource[]

      return {
        data: {
          collection: transformedCollection,
          meta: response.data.meta
        }
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
      throw error
    }
  }

  const getSingleArticle = async (id: string): Promise<SingleArticleResponse> => {
    try {
      const response = await authenticatedFetch<SingleArticleResponse>(`/api/articles/${id}`)
      return response
    } catch (error) {
      console.error('Error fetching article:', error)
      throw error
    }
  }

  const createArticle = async (body: ArticleRequest): Promise<SingleArticleResponse> => {
    try {
      const response = await authenticatedFetch<SingleArticleResponse>('/api/articles', {
        method: 'POST',
        body
      })

      return response
    } catch (error) {
      console.error('Error creating article:', error)
      throw error
    }
  }

  const updateArticle = async (id: string, body: ArticleUpdateRequest): Promise<SingleArticleResponse> => {
    try {
      const response = await authenticatedFetch<SingleArticleResponse>(`/api/articles/${id}`, {
        method: 'PUT',
        body
      })

      return response
    } catch (error) {
      console.error('Error updating article:', error)
      throw error
    }
  }

  const deleteArticle = async (id: string): Promise<void> => {
    try {
      await authenticatedFetch(`/api/articles/${id}`, {
        method: 'DELETE'
      })
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