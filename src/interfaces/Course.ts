/**
 * Course related interfaces for the teacher dashboard application
 * Represents courses that can be assigned to classes
 */

// Difficulty rating type for course difficulty levels
export type DifficultyRating = 'easy' | 'medium' | 'hard' | 'advanced';

// Basic Course interface matching the Course model from the backend
export interface Course {
  id: number;
  title: string;
  description: string;
  date: string; // ISO date string format
  total_marks: number;
  difficulty_rating: DifficultyRating;
  teacher_id: number;
}

// Interface for course creation/update request
export interface CourseRequest {
  title: string;
  description: string;
  date: string; // ISO date string format
  total_marks: number;
  difficulty_rating: DifficultyRating;
}

// Interface for assigning a course to a class (for drag and drop)
export interface CourseDragEvent {
  courseId: number;
  classId: number;
}

// Course state interface for the Pinia store
export interface CourseState {
  courses: Course[];
  filteredCourses: Course[];
  currentCourse: Course | null;
  isLoading: boolean;
  error: string | null;
}

// Interface for filtering courses
export interface CourseFilters {
  title?: string;
  difficulty?: DifficultyRating;
  dateFrom?: string;
  dateTo?: string;
}