export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

  return {
    config: {
      supabase_url: supabaseUrl || 'NOT_SET',
      has_anon_key: !!supabaseAnonKey,
      has_secret_key: !!supabaseSecretKey,
      anon_key_length: supabaseAnonKey?.length || 0,
      secret_key_length: supabaseSecretKey?.length || 0,
      anon_key_prefix: supabaseAnonKey?.substring(0, 20) + '...' || 'NOT_SET',
      secret_key_prefix: supabaseSecretKey?.substring(0, 20) + '...' || 'NOT_SET'
    },
    endpoints: {
      auth_url: supabaseUrl ? `${supabaseUrl}/auth/v1` : 'NOT_AVAILABLE',
      rest_url: supabaseUrl ? `${supabaseUrl}/rest/v1` : 'NOT_AVAILABLE'
    }
  }
}) 