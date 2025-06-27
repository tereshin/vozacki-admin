import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

export interface AnswerResource extends Tables<'answers'> {}

export interface AnswerResponse {
  data: {
    collection: AnswerResource[];
    meta: MetaResponse;
  };
}

export interface SingleAnswerResponse {
  data: AnswerResource;
}

export interface AnswerRequest extends Omit<TablesInsert<'answers'>, 'uid'> {
  uid?: string;
}

export interface AnswerUpdateRequest extends TablesUpdate<'answers'> {}

export interface ErrorDetailsAnswer {
  text?: string[];
  language_id?: string[];
  question_uid?: string[];
  is_correct?: string[];
} 