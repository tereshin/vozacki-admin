export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AdministratorUser extends User {
  role?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AdministratorUser | null;
  session: {
    access_token: string;
    expires_in: number;
    user?: AdministratorUser;
  } | null;
  error?: string;
}

export interface AuthState {
  user: AdministratorUser | null;
  session: any | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface ErrorDetailsAuth {
  message: string;
  status?: number;
} 