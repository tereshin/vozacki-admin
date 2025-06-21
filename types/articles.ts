import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

export interface ArticleResource extends Tables<'articles'> {}

export interface ArticleResponse {
  data: {
    collection: ArticleResource[];
    meta: MetaResponse;
  };
}

export interface SingleArticleResponse {
  data: ArticleResource;
}

export interface ArticleRequest extends TablesInsert<'articles'> {}

export interface ArticleUpdateRequest extends TablesUpdate<'articles'> {}

export interface ErrorDetailsArticle {
  title?: string[];
  slug?: string[];
  content?: string[];
  language_id?: string[];
} 