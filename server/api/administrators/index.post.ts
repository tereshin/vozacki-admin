export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    if (!body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password is required'
      })
    }

    // Создаем пользователя в Supabase Auth
    const { data: authUser, error: authError } = await serverSupabaseClient.auth.admin.createUser({
      id: crypto.randomUUID(),
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        first_name: body.first_name,
        last_name: body.last_name,
        display_name: body.display_name
      }
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      throw createError({
        statusCode: 400,
        statusMessage: authError.message || 'Error creating user authentication'
      })
    }

    // Получаем запись администратора по email
    const { data, error } = await serverSupabaseClient
      .from('administrators')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('email', body.email)
      .single()

    if (error) {
      console.error('Administrator fetch error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching administrator',
        data: error
      })
    }

    // Обновляем обязательные поля администратора
    if (data) {
      const updateFields: any = {}
      if (body.display_name && data.display_name !== body.display_name) {
        updateFields.display_name = body.display_name
      }
      if (body.first_name && data.first_name !== body.first_name) {
        updateFields.first_name = body.first_name
      }
      if (body.last_name && data.last_name !== body.last_name) {
        updateFields.last_name = body.last_name
      }
      if (body.role_id && data.role_id !== body.role_id) {
        updateFields.role_id = body.role_id
      }
      if (Object.keys(updateFields).length > 0) {
        await serverSupabaseClient
          .from('administrators')
          .update(updateFields)
          .eq('id', data.id)
      }
    }

    // Получаем обновленную запись администратора
    const { data: updatedAdmin, error: updatedError } = await serverSupabaseClient
      .from('administrators')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('email', body.email)
      .single()

    if (updatedError) {
      console.error('Administrator fetch after update error:', updatedError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching updated administrator',
        data: updatedError
      })
    }

    const administrator = {
      ...updatedAdmin,
      full_name: updatedAdmin.display_name || `${updatedAdmin.first_name || ''} ${updatedAdmin.last_name || ''}`.trim()
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