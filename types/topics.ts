import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

export interface TopicResource extends Tables<'topics'> {}

export interface TopicResponse {
  data: {
    collection: TopicResource[];
    meta: MetaResponse;
  };
}

export interface SingleTopicResponse {
  data: TopicResource;
}

export interface TopicRequest extends TablesInsert<'topics'> {}

export interface TopicUpdateRequest extends TablesUpdate<'topics'> {}

export interface ErrorDetailsTopic {
  name?: string[];
  description?: string[];
  language_id?: string[];
} 