import type { Database } from '~/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

export const useSupabase = (): SupabaseClient<Database> => {
  const { $supabase } = useNuxtApp()
  return $supabase as SupabaseClient<Database>
} 