export const API_ENDPOINTS = {
  articles: 'articles',
  categories: 'categories', 
  topics: 'topics',
  tests: 'tests',
  administrators: 'administrators',
  auth: 'auth',
  roles: 'roles',
  languages: 'languages',
  dashboard: 'dashboard',
  answers: 'answers',
  questions: 'questions',
  'exam-config': 'exam-config',
  'content-uids': 'content-uids'
} as const

export const API_METHODS = {
  GET: 'GET',
  POST: 'POST', 
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const

export const SUPABASE_TABLES = {
  articles: 'articles',
  categories: 'categories',
  topics: 'topics',
  tests: 'tests',
  administrators: 'administrators',
  roles: 'roles',
  languages: 'languages',
  answers: 'answers',
  questions: 'questions',
  exam_config: 'exam_config',
  content_uids: 'content_uids'
} as const

export type ApiEndpoint = keyof typeof API_ENDPOINTS
export type ApiMethod = keyof typeof API_METHODS
export type SupabaseTable = keyof typeof SUPABASE_TABLES

export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100 