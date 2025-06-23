import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

export interface ExamConfigResource extends Tables<'exam_config'> {}

export interface ExamConfigResponse {
  data: {
    collection: ExamConfigResource[];
    meta: MetaResponse;
  };
}

export interface SingleExamConfigResponse {
  data: ExamConfigResource;
}

export interface ExamConfigRequest extends TablesInsert<'exam_config'> {}

export interface ExamConfigUpdateRequest extends TablesUpdate<'exam_config'> {}

export interface ErrorDetailsExamConfig {
  duration_minutes?: string[];
  max_incorrect_answers?: string[];
  passing_percentage?: string[];
  total_questions?: string[];
} 