import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  // Проверяем наличие необходимых переменных окружения
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabasePublishableKey
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration:', {
      url: supabaseUrl,
      key: supabaseKey ? '[PRESENT]' : '[MISSING]'
    })
    throw new Error('Supabase URL and key are required. Please check your environment variables.')
  }
  
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  return {
    provide: {
      supabase
    }
  }
}) 