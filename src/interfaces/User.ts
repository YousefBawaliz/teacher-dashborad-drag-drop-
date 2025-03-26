/**
 * User related interfaces for the teacher dashboard application
 * Extends the basic User interface from Auth.ts with additional functionality
 */

import { type UserRole, type User as BaseUser } from './Auth';
import { type Class } from './Class';
import { type Course } from './Course';

// Extended User interface with associated data
export interface UserWithRelations extends BaseUser {
  // For teachers: classes they teach
  teaching_classes?: Class[];
  
  // For teachers: courses they've created
  created_courses?: Course[];
  
  // For students: classes they're enrolled in
  enrolled_classes?: Class[];
  
  // For students: courses they're taking (derived from enrolled classes)
  enrolled_courses?: Course[];
}

// Interface for user creation (admin functionality, not included in phase 1)
export interface UserCreateRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

// Interface for user profile update
export interface UserUpdateRequest {
  email?: string;
  name?: string;
  current_password?: string;
  new_password?: string;
}

// User state interface for the Pinia store (if needed beyond auth store)
export interface UserState {
  users: BaseUser[];
  currentUserDetails: UserWithRelations | null;
  isLoading: boolean;
  error: string | null;
}