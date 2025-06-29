import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'
import { getRouterParams } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content access (administrator, moderator, or user can view)
    await requirePermission(event, 'view_content')
    
    const id = getRouterParams(event).id

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Article ID is required'
      })
    }

    const { data, error } = await serverSupabaseClient
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw createError({
        statusCode: 404,
        statusMessage: error.message || 'Article not found'
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error fetching article:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
}) 