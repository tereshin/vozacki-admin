export interface BaseApiParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
}

export interface EntityParams<T = any> extends BaseApiParams {
  filters?: T;
}

export interface LanguageFilterParams {
  language_id?: string;
}

export interface CategoryFilterParams extends LanguageFilterParams {
  category_uid?: string;
  parent_category_uid?: string;
}

export interface TopicFilterParams extends LanguageFilterParams {
  topic_uid?: string;
}

export interface TestFilterParams extends TopicFilterParams {
  points?: number;
}

export interface DateFilterParams {
  date_from?: string;
  date_to?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

import type { MetaResponse } from './general'

export interface BaseResponse<T> {
  data: {
    collection: T[];
    meta: MetaResponse;
  };
}

export interface BaseSingleResponse<T> {
  data: T;
} 