import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

export interface AdministratorResource extends Tables<'administrators'> {
  full_name?: string;
}

export interface AdministratorResponse {
  data: {
    collection: AdministratorResource[];
    meta: MetaResponse;
  };
}

export interface SingleAdministratorResponse {
  data: AdministratorResource;
}

export interface AdministratorRequest extends TablesInsert<'administrators'> {}

export interface AdministratorUpdateRequest extends TablesUpdate<'administrators'> {}

export interface ErrorDetailsAdministrator {
  email?: string[];
  first_name?: string[];
  last_name?: string[];
  role?: string[];
} 