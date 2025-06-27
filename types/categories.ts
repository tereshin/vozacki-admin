import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

export interface CategoryResource extends Tables<'categories'> {}

export interface CategoryResponse {
  data: {
    collection: CategoryResource[];
    meta: MetaResponse;
  };
}

export interface SingleCategoryResponse {
  data: CategoryResource;
}

export interface CategoryRequest extends TablesInsert<'categories'> {}

export interface CategoryUpdateRequest extends Omit<TablesUpdate<'categories'>, 'language_id'> {}

export interface ErrorDetailsCategory {
  name?: string[];
  slug?: string[];
  description?: string[];
  language_id?: string[];
} 