import type { 
  AdministratorResource, 
  AdministratorRequest, 
  AdministratorUpdateRequest,
  AdministratorResponse,
  SingleAdministratorResponse 
} from '~/types/administrators'
import type { Tables } from '~/types/database'

export const useAdministratorsApi = () => {
  const supabase = useSupabase()

  const getAdministrators = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<AdministratorResponse> => {
    try {
      let query = supabase
        .from('administrators')
        .select('*', { count: 'exact' })

      if (params?.search) {
        query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
      }

      const page = params?.page || 1
      const perPage = params?.per_page || 10
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      query = query.range(from, to).order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) throw error

      const collection = (data || []).map((item: Tables<'administrators'>) => ({
        ...item,
        full_name: `${item.first_name || ''} ${item.last_name || ''}`.trim()
      })) as AdministratorResource[]

      return {
        data: {
          collection,
          meta: {
            current_page: page,
            from: from + 1,
            last_page: Math.ceil((count || 0) / perPage),
            per_page: perPage,
            to: Math.min(to + 1, count || 0),
            total: count || 0
          }
        }
      }
    } catch (error) {
      console.error('Error fetching administrators:', error)
      throw error
    }
  }

  const getSingleAdministrator = async (id: string): Promise<SingleAdministratorResponse> => {
    try {
      const { data, error } = await supabase
        .from('administrators')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      const administrator = {
        ...data,
        full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim()
      } as AdministratorResource

      return {
        data: administrator
      }
    } catch (error) {
      console.error('Error fetching administrator:', error)
      throw error
    }
  }

  const createAdministrator = async (body: AdministratorRequest): Promise<SingleAdministratorResponse> => {
    try {
      const { data, error } = await supabase
        .from('administrators')
        .insert(body)
        .select()
        .single()

      if (error) throw error

      const administrator = {
        ...data,
        full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim()
      } as AdministratorResource

      return {
        data: administrator
      }
    } catch (error) {
      console.error('Error creating administrator:', error)
      throw error
    }
  }

  const updateAdministrator = async (id: string, body: AdministratorUpdateRequest): Promise<SingleAdministratorResponse> => {
    try {
      const { data, error } = await supabase
        .from('administrators')
        .update({
          ...body,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const administrator = {
        ...data,
        full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim()
      } as AdministratorResource

      return {
        data: administrator
      }
    } catch (error) {
      console.error('Error updating administrator:', error)
      throw error
    }
  }

  const deleteAdministrator = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('administrators')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting administrator:', error)
      throw error
    }
  }

  return {
    getAdministrators,
    getSingleAdministrator,
    createAdministrator,
    updateAdministrator,
    deleteAdministrator
  }
} 