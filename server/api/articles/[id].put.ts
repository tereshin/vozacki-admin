import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'
import { getRouterParams } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const id = getRouterParams(event).id
    const body = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Article ID is required'
      })
    }

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
      .update({
        title: body.title,
        slug: body.slug,
        content: body.content,
        language_id: body.language_id,
        category_uid: body.category_uid || null,
        published_at: body.published_at || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating article:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update article'
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error updating article:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 