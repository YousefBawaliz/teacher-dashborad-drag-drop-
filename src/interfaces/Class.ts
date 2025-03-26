/**
 * Class related interfaces for the teacher dashboard application
 * Represents school classes with enrolled students and assigned courses
 */

import { type User } from './Auth';
import { type Course } from './Course';

// Basic Class interface matching the Class model from the backend
export interface Class {
  id: number;
  name: string;
  section_number: string;
  teacher_id: number;
}

// Extended Class interface with related data
export interface ClassWithRelations extends Class {
  teacher?: User;
  students?: User[];
  courses?: Course[];
}

// Interface for class creation request
export interface ClassCreateRequest {
  name: string;
  section_number: string;
}

// Interface for class update request
export interface ClassUpdateRequest {
  name?: string;
  section_number?: string;
}

// Interface for adding/removing a course to/from a class
export interface ClassCourseOperation {
  class_id: number;
  course_id: number;
}

// Interface for adding/removing a student to/from a class
export interface ClassStudentOperation {
  class_id: number;
  student_id: number;
}

// Class state interface for the Pinia store
export interface ClassState {
  classes: Class[];
  currentClass: ClassWithRelations | null;
  isLoading: boolean;
  error: string | null;
}