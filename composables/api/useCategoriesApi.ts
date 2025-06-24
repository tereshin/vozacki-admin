import type { 
  CategoryResource, 
  CategoryRequest, 
  CategoryUpdateRequest,
  CategoryResponse,
  SingleCategoryResponse 
} from '~/types/categories'

export const useCategoriesApi = () => {
  const { authenticatedFetch } = useAuthenticatedFetch()

  const getCategories = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    language_id?: string;
    parent_category_uid?: string;
  }): Promise<CategoryResponse> => {
    try {
      return await authenticatedFetch('/api/categories', {
        method: 'GET',
        query: params
      })
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  const getSingleCategory = async (id: string): Promise<SingleCategoryResponse> => {
    try {
      return await authenticatedFetch(`/api/categories/${id}`, {
        method: 'GET'
      })
    } catch (error) {
      console.error('Error fetching category:', error)
      throw error
    }
  }

  const createCategory = async (body: CategoryRequest): Promise<SingleCategoryResponse> => {
    try {
      return await authenticatedFetch('/api/categories', {
        method: 'POST',
        body
      })
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  const updateCategory = async (id: string, body: CategoryUpdateRequest): Promise<SingleCategoryResponse> => {
    try {
      return await authenticatedFetch(`/api/categories/${id}`, {
        method: 'PUT',
        body
      })
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await authenticatedFetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  return {
    getCategories,
    getSingleCategory,
    createCategory,
    updateCategory,
    deleteCategory
  }
} 