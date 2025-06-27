import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

export interface TestResource extends Tables<'tests'> {}

export interface TestResponse {
  data: {
    collection: TestResource[];
    meta: MetaResponse;
  };
}

export interface SingleTestResponse {
  data: TestResource;
}

export interface TestRequest extends Omit<TablesInsert<'tests'>, 'uid'> {
  uid?: string;
}

export interface TestUpdateRequest extends TablesUpdate<'tests'> {}

export interface ErrorDetailsTest {
  title?: string[];
  description?: string[];
  language_id?: string[];
  topic_uid?: string[];
} 