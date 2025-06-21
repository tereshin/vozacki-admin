export interface MetaResponse {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface BaseResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: MetaResponse;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface BreadcrumbItem {
  label: string;
  to?: string;
} 

// ICONS
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconColor = 'default' | 'primary' | 'secondary' | 'white' | 'gray';
export type IconName =
    | 'sidebar-open'
    | 'sidebar-close'
    | 'flag'
    | 'folder-plus'
    | 'user-square';