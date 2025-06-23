import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

export interface ContentUidResource extends Tables<'content_uids'> {}

export interface ContentUidResponse {
  data: {
    collection: ContentUidResource[];
    meta: MetaResponse;
  };
}

export interface SingleContentUidResponse {
  data: ContentUidResource;
}

export interface ContentUidRequest extends TablesInsert<'content_uids'> {}

export interface ContentUidUpdateRequest extends TablesUpdate<'content_uids'> {}

export interface ErrorDetailsContentUid {
  content_type?: string[];
  uid?: string[];
} 