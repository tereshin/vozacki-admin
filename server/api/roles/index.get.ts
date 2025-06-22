export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { 
      page = 1, 
      per_page = 10, 
      search,
      sort_field = 'name',
      sort_order = 'asc'
    } = query

    let supabaseQuery = serverSupabaseClient
      .from('roles')
      .select('*', { count: 'exact' })

    if (search) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${search}%,code.ilike.%${search}%`
      )
    }

    const pageNum = Number(page)
    const perPage = Number(per_page)
    const from = (pageNum - 1) * perPage
    const to = from + perPage - 1

    const ascending = sort_order === 'asc'
    const sortField = String(sort_field)
    supabaseQuery = supabaseQuery
      .range(from, to)
      .order(sortField, { ascending })

    const { data, error, count } = await supabaseQuery

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching roles',
        data: error
      })
    }

    return {
      data: {
        collection: data || [],
        meta: {
          current_page: pageNum,
          from: from + 1,
          last_page: Math.ceil((count || 0) / perPage),
          per_page: perPage,
          to: Math.min(to + 1, count || 0),
          total: count || 0
        }
      }
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