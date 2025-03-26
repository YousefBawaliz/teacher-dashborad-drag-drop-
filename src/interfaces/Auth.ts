/**
 * Auth related interfaces for authentication and user management
 */

// Define possible user roles in the system
export type UserRole = 'teacher' | 'student';

// User interface matching the User model from the backend
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

// Login credentials interface for authentication requests
export interface LoginCredentials {
  email: string;
  password: string;
}

// Login response interface from the authentication API
export interface LoginResponse {
  user: User;
  success: boolean;
  message?: string;
}

// Auth state interface for the Pinia store
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}