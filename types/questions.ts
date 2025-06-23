import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

export interface QuestionResource extends Tables<'questions'> {}

export interface QuestionResponse {
  data: {
    collection: QuestionResource[];
    meta: MetaResponse;
  };
}

export interface SingleQuestionResponse {
  data: QuestionResource;
}

export interface QuestionRequest extends TablesInsert<'questions'> {}

export interface QuestionUpdateRequest extends TablesUpdate<'questions'> {}

export interface ErrorDetailsQuestion {
  text?: string[];
  language_id?: string[];
  test_uid?: string[];
  points?: string[];
} 