import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { type AuthState, type User, type LoginCredentials, type LoginResponse } from '../interfaces/Auth';

/**
 * Authentication store for managing user login/logout and session state
 * In production, this would interact with the actual authentication API
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const currentUser = computed(() => user.value);
  const userRole = computed(() => user.value?.role || null);
  const isTeacher = computed(() => user.value?.role === 'teacher');
  const isStudent = computed(() => user.value?.role === 'student');

  // Mock users for development (would be removed in production)
  const mockUsers: User[] = [
    { id: 1, email: 'teacher@example.com', name: 'Jane Teacher', role: 'teacher' },
    { id: 2, email: 'student@example.com', name: 'John Student', role: 'student' },
    { id: 3, email: 'teacher2@example.com', name: 'Mike Johnson', role: 'teacher' }
  ];

  // Actions
  /**
   * Login action - authenticates user with provided credentials
   * In development, this uses mock users instead of an actual API call
   */
  async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock authentication logic (replace with actual API call in production)
      const foundUser = mockUsers.find(u => u.email === credentials.email);
      
      if (foundUser && credentials.password === 'password') { // In real app, would use proper password verification
        user.value = foundUser;
        isAuthenticated.value = true;
        localStorage.setItem('user', JSON.stringify(foundUser));
        
        return {
          user: foundUser,
          success: true
        };
      } else {
        error.value = 'Invalid email or password';
        return {
          user: null as unknown as User, // Type assertion to satisfy interface
          success: false,
          message: 'Invalid email or password'
        };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      error.value = message;
      return {
        user: null as unknown as User, // Type assertion to satisfy interface
        success: false,
        message
      };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout action - clears the current session
   */
  function logout(): void {
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('user');
  }

  /**
   * Initialize auth state from localStorage (if available)
   */
  function initAuth(): void {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
        isAuthenticated.value = true;
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Getters
    currentUser,
    userRole,
    isTeacher,
    isStudent,
    
    // Actions
    login,
    logout,
    initAuth
  };
});