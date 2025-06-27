import type { 
  ArticleResource, 
  ArticleRequest, 
  ArticleUpdateRequest,
  ArticleResponse,
  SingleArticleResponse,
  EditorJSData 
} from '~/types/articles'
import type { CategoryFilterParams, EntityParams } from '~/types/api'

interface ArticleFilterParams extends CategoryFilterParams {
  // Дополнительные фильтры для статей могут быть добавлены здесь
}

export const useArticlesApi = () => {
  const crudMixin = useCrudMixin<
    ArticleResource,
    ArticleRequest,
    ArticleUpdateRequest,
    ArticleResponse,
    SingleArticleResponse,
    ArticleFilterParams
  >('articles', ['title', 'content', 'description'])

  // Специальная логика для статей с трансформацией EditorJS контента
  const getArticles = async (params?: EntityParams<ArticleFilterParams>): Promise<ArticleResponse> => {
    try {
      const response = await crudMixin.getItems(params)

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
      throw error
    }
  }

  return {
    getArticles,
    getSingleArticle: crudMixin.getSingleItem,
    createArticle: crudMixin.createItem,
    updateArticle: crudMixin.updateItem,
    deleteArticle: crudMixin.deleteItem
  }
} 