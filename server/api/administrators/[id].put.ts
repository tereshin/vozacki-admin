import { getRouterParams } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParams(event).id
    const body = await readBody(event)
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Administrator ID is required'
      })
    }

    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await serverSupabaseClient
      .from('administrators')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        role:roles(*)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Administrator not found'
        })
      }
      if (error.code === '23505') { // Unique constraint violation
        throw createError({
          statusCode: 409,
          statusMessage: 'Administrator with this email already exists'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Error updating administrator',
        data: error
      })
    }

    const administrator = {
      ...data,
      full_name: data.display_name || `${data.first_name || ''} ${data.last_name || ''}`.trim()
    }

    return {
      data: administrator
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Server error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 