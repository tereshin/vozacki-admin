import type { Tables, TablesInsert, TablesUpdate } from './database'
import type { MetaResponse } from './general'

export interface AdministratorResource extends Tables<'administrators'> {
  first_name: string;
  last_name: string;
  full_name: string;
  role?: Tables<'roles'>;
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

export interface AdministratorRequest extends Omit<TablesInsert<'administrators'>, 'id'> {
  id?: string;
  password?: string;
}

export interface AdministratorUpdateRequest extends TablesUpdate<'administrators'> {
  password?: string;
}

export interface ErrorDetailsAdministrator {
  display_name?: string[];
  email?: string[];
  first_name?: string[];
  last_name?: string[];
  role_id?: string[];
  password?: string[];
}

// Role types
export interface RoleResource extends Tables<'roles'> {}

export interface RoleResponse {
  data: {
    collection: RoleResource[];
    meta: MetaResponse;
  };
}

export interface SingleRoleResponse {
  data: RoleResource;
}

export interface RoleRequest extends TablesInsert<'roles'> {}

export interface RoleUpdateRequest extends TablesUpdate<'roles'> {}

export interface ErrorDetailsRole {
  name?: string[];
  code?: string[];
} 