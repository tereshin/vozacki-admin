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

    const supabase = serverSupabaseClient

    // Use provided uid or generate new one
    const articleUid = body.uid || crypto.randomUUID()

    // Create content_uid record first
    const { error: contentUidError } = await supabase
      .from('content_uids')
      .insert({
        uid: articleUid,
        content_type: 'article'
      })

    if (contentUidError) {
      // If uid already exists, it's okay for update operations
      if (contentUidError.code !== '23505') { // 23505 is duplicate key error
        throw createError({
          statusCode: 500,
          statusMessage: contentUidError.message || 'Failed to create content uid',
          data: contentUidError
        })
      }
    }

    // Create article record
    const { data, error } = await supabase
      .from('articles')
      .insert({
        id: body.id || crypto.randomUUID(),
        title: body.title,
        slug: body.slug,
        content: body.content,
        language_id: body.language_id,
        category_uid: body.category_uid || null,
        published_at: body.published_at || null,
        uid: articleUid
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to create article',
        data: error
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
      statusMessage: error.message || 'Internal server error'
    })
  }
}) 