import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category ID is required'
      })
    }

    // Check if category exists
    const { data: existingCategory, error: fetchError } = await serverSupabaseClient
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Category not found'
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch category',
        data: fetchError
      })
    }

    // Check if category has subcategories
    const { count: subcategoriesCount, error: subcategoriesError } = await serverSupabaseClient
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('parent_category_uid', existingCategory.uid)

    if (subcategoriesError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check subcategories',
        data: subcategoriesError
      })
    }

    if (subcategoriesCount && subcategoriesCount > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Cannot delete category with subcategories'
      })
    }

    // Check if category is used by articles
    const { count: articlesCount, error: articlesError } = await serverSupabaseClient
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('category_uid', existingCategory.uid)

    if (articlesError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check articles',
        data: articlesError
      })
    }

    if (articlesCount && articlesCount > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Cannot delete category that is used by articles'
      })
    }

    // Delete category
    const { error } = await serverSupabaseClient
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete category',
        data: error
      })
    }

    // Delete content_uid record
    if (existingCategory.uid) {
      const { error: contentUidError } = await serverSupabaseClient
        .from('content_uids')
        .delete()
        .eq('uid', existingCategory.uid)

      if (contentUidError) {
        console.warn('Failed to delete content_uid:', contentUidError)
      }
    }

    return {
      message: 'Category deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting category:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 