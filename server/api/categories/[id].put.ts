import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category ID is required'
      })
    }

    // Validate required fields
    const errors: Record<string, string[]> = {}
    
    if (!body.name?.trim()) {
      errors.name = ['Name is required']
    }
    
    if (!body.slug?.trim()) {
      errors.slug = ['Slug is required']
    } else if (!/^[a-z0-9-]+$/.test(body.slug)) {
      errors.slug = ['Slug can only contain lowercase letters, numbers, and hyphens']
    }

    if (Object.keys(errors).length > 0) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation failed',
        data: { details: errors }
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

    // Update category record
    const { data, error } = await serverSupabaseClient
      .from('categories')
      .update({
        name: body.name.trim(),
        slug: body.slug.trim(),
        description: body.description?.trim() || null,
        parent_category_uid: body.parent_category_uid || null,
        uid: body.uid || existingCategory.uid
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update category',
        data: error
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error updating category:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 