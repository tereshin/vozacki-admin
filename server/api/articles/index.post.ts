import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const body = await readBody(event)

    // Validate required fields
    const errors: Record<string, string[]> = {}
    
    if (!body.title?.trim()) {
      errors.title = ['Title is required']
    }
    
    if (!body.slug?.trim()) {
      errors.slug = ['Slug is required']
    } else if (!/^[a-z0-9-]+$/.test(body.slug)) {
      errors.slug = ['Slug can only contain lowercase letters, numbers, and hyphens']
    }
    
    if (!body.language_id) {
      errors.language_id = ['Language is required']
    }
    
    if (!body.content?.blocks?.length) {
      errors.content = ['Content is required']
    }

    if (Object.keys(errors).length > 0) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation failed',
        data: { details: errors }
      })
    }

    const { data, error } = await serverSupabaseClient
      .from('articles')
      .insert({
        id: body.id,
        title: body.title,
        slug: body.slug,
        content: body.content,
        language_id: body.language_id,
        category_uid: body.category_uid || null,
        published_at: body.published_at || null,
        uid: body.uid
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create article'
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error creating article:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 