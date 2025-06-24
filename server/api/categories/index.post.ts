import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const body = await readBody(event)

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
    
    if (!body.language_id) {
      errors.language_id = ['Language is required']
    }

    if (Object.keys(errors).length > 0) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation failed',
        data: { details: errors }
      })
    }

    const supabase = serverSupabaseClient

    // Use provided uid or generate new one
    const categoryUid = body.uid || crypto.randomUUID()

    // Create content_uid record first
    const { error: contentUidError } = await supabase
      .from('content_uids')
      .insert({
        uid: categoryUid,
        content_type: 'category'
      })

    if (contentUidError) {
      // If uid already exists, it's okay for update operations
      if (contentUidError.code !== '23505') { // 23505 is duplicate key error
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create content uid',
          data: contentUidError
        })
      }
    }

    // Create category record
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: body.name.trim(),
        slug: body.slug.trim(),
        description: body.description?.trim() || null,
        language_id: body.language_id,
        parent_category_uid: body.parent_category_uid || null,
        uid: categoryUid
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create category',
        data: error
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error creating category:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 