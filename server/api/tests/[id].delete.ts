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
        statusMessage: 'Test ID is required'
      })
    }

    // Check if test exists
    const { data: existingTest, error: fetchError } = await serverSupabaseClient
      .from('tests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Test not found'
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch test',
        data: fetchError
      })
    }

    // Delete related questions first
    const { error: questionsError } = await serverSupabaseClient
      .from('questions')
      .delete()
      .eq('test_uid', existingTest.uid)

    if (questionsError) {
      console.warn('Failed to delete test questions:', questionsError)
      // Continue with test deletion even if questions deletion fails
    }

    // Delete test
    const { error } = await serverSupabaseClient
      .from('tests')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete test',
        data: error
      })
    }

    // Delete content_uid record
    if (existingTest.uid) {
      const { error: contentUidError } = await serverSupabaseClient
        .from('content_uids')
        .delete()
        .eq('uid', existingTest.uid)

      if (contentUidError) {
        console.warn('Failed to delete content_uid:', contentUidError)
      }
    }

    return {
      message: 'Test deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting test:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 