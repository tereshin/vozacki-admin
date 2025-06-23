import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

// EditorJS types
export interface EditorJSBlock {
  id?: string
  type: string
  data: Record<string, any>
}

export interface EditorJSData {
  time?: number
  blocks: EditorJSBlock[]
  version?: string
}

export interface ArticleResource extends Omit<Tables<'articles'>, 'content'> {
  content: EditorJSData
}

export interface ArticleResponse {
  data: {
    collection: ArticleResource[];
    meta: MetaResponse;
  };
}

export interface SingleArticleResponse {
  data: ArticleResource;
}

export interface ArticleRequest extends Omit<TablesInsert<'articles'>, 'content'> {
  content: EditorJSData
}

export interface ArticleUpdateRequest extends Omit<TablesUpdate<'articles'>, 'content'> {
  content?: EditorJSData
}

export interface ErrorDetailsArticle {
  title?: string[];
  slug?: string[];
  content?: string[];
  language_id?: string[];
} 