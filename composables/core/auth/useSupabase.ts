import type { Database } from '~/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

export const useSupabase = (): SupabaseClient<Database> => {
  // Проверяем, что мы на клиентской стороне
  if (process.server) {
    throw new Error('useSupabase can only be used on the client side')
  }

  const nuxtApp = useNuxtApp()
  
  if (!nuxtApp) {
    throw new Error('Nuxt app is not available')
  }
  
  const { $supabase } = nuxtApp
  
  if (!$supabase) {
    console.error('Supabase client is not available in Nuxt app')
    throw new Error('Supabase client is not available. Make sure the supabase plugin is properly configured.')
  }
  
  return $supabase as SupabaseClient<Database>
} 