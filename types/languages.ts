import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

export interface LanguageResource extends Tables<'languages'> {}

export interface LanguageResponse {
  data: {
    collection: LanguageResource[];
    meta: MetaResponse;
  };
}

export interface SingleLanguageResponse {
  data: LanguageResource;
}

export interface LanguageRequest extends TablesInsert<'languages'> {}

export interface LanguageUpdateRequest extends TablesUpdate<'languages'> {}

export interface ErrorDetailsLanguage {
  name?: string[];
  code?: string[];
  script?: string[];
} 