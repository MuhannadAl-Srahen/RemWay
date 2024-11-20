// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: string
  email: string
  username: string
  fullName: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  session: unknown | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  username: string
  fullName: string
}
