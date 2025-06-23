import type { 
  CategoryResource, 
  CategoryRequest, 
  CategoryUpdateRequest,
  CategoryResponse,
  SingleCategoryResponse 
} from '~/types/categories'

export const useCategoriesApi = () => {
  const supabase = useSupabase()

  const getCategories = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    language_id?: string;
    parent_category_uid?: string;
  }): Promise<CategoryResponse> => {
    try {
      let query = supabase
        .from('categories')
        .select('*', { count: 'exact' })

      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%,slug.ilike.%${params.search}%`)
      }

      if (params?.language_id) {
        query = query.eq('language_id', params.language_id)
      }

      if (params?.parent_category_uid) {
        query = query.eq('parent_category_uid', params.parent_category_uid)
      }

      const page = params?.page || 1
      const perPage = params?.per_page || 10
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      query = query.range(from, to).order('name', { ascending: true })

      const { data, error, count } = await query

      if (error) throw error

      const collection = (data || []) as CategoryResource[]

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
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  const getSingleCategory = async (id: string): Promise<SingleCategoryResponse> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data: data as CategoryResource
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      throw error
    }
  }

  const createCategory = async (body: CategoryRequest): Promise<SingleCategoryResponse> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(body)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as CategoryResource
      }
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  const updateCategory = async (id: string, body: CategoryUpdateRequest): Promise<SingleCategoryResponse> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(body)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data: data as CategoryResource
      }
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
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