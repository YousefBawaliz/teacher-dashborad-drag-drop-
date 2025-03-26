import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { type Course, type CourseState, type CourseRequest, type CourseFilters, type DifficultyRating } from '../interfaces/Course';
import { useAuthStore } from './auth.store';

/**
 * Course store for managing course data and operations
 * In production, this would interact with the actual course API
 */
export const useCourseStore = defineStore('course', () => {
  // State
  const courses = ref<Course[]>([]);
  const filteredCourses = ref<Course[]>([]);
  const currentCourse = ref<Course | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Get auth store for user information
  const authStore = useAuthStore();

  // Mock data for development (would be removed in production)
  const mockCourses: Course[] = [
    { 
      id: 1, 
      title: 'Introduction to Mathematics', 
      description: 'Basic mathematical concepts and operations', 
      date: '2025-04-15', 
      total_marks: 100, 
      difficulty_rating: 'easy', 
      teacher_id: 1 
    },
    { 
      id: 2, 
      title: 'Advanced Physics', 
      description: 'Complex physical principles and theories', 
      date: '2025-05-20', 
      total_marks: 150, 
      difficulty_rating: 'hard', 
      teacher_id: 1 
    },
    { 
      id: 3, 
      title: 'English Literature', 
      description: 'Classic and contemporary literature analysis', 
      date: '2025-04-10', 
      total_marks: 100, 
      difficulty_rating: 'medium', 
      teacher_id: 3 
    },
    { 
      id: 4, 
      title: 'Computer Science Fundamentals', 
      description: 'Introduction to programming concepts', 
      date: '2025-06-05', 
      total_marks: 120, 
      difficulty_rating: 'medium', 
      teacher_id: 3 
    },
    { 
      id: 5, 
      title: 'Biology Basics', 
      description: 'Introduction to biological systems and processes', 
      date: '2025-04-22', 
      total_marks: 100, 
      difficulty_rating: 'easy', 
      teacher_id: 1 
    },
    { 
      id: 6, 
      title: 'Chemistry 101', 
      description: 'Fundamental chemistry principles and experiments', 
      date: '2025-05-10', 
      total_marks: 120, 
      difficulty_rating: 'medium', 
      teacher_id: 1 
    }
  ];

  // Getters
  const teacherCourses = computed(() => {
    if (!authStore.user) return [];
    return courses.value.filter(course => course.teacher_id === authStore.user?.id);
  });

  const sortedCourses = computed(() => {
    return [...courses.value].sort((a, b) => {
      // Sort by date (most recent first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  });

  const coursesByDifficulty = computed(() => {
    const result: Record<DifficultyRating, Course[]> = {
      easy: [],
      medium: [],
      hard: [],
      advanced: []
    };
    
    courses.value.forEach(course => {
      result[course.difficulty_rating].push(course);
    });
    
    return result;
  });

  // Actions
  /**
   * Fetch all courses based on the current user's role
   */
  async function fetchCourses(): Promise<void> {
    if (!authStore.isAuthenticated) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock API response (replace with actual API call in production)
      if (authStore.isTeacher) {
        // For teachers, get courses they created
        courses.value = mockCourses.filter(course => course.teacher_id === authStore.user?.id);
      } else {
        // For students, in a real app this would get courses from their enrolled classes
        // For mock data, we'll just return some courses for testing
        courses.value = mockCourses.slice(0, 3);
      }
      
      // Initialize filtered courses with all courses
      filteredCourses.value = [...courses.value];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch courses';
      error.value = message;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch a specific course by ID
   */
  async function fetchCourseById(courseId: number): Promise<void> {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock API response (replace with actual API call in production)
      const foundCourse = mockCourses.find(course => course.id === courseId);
      
      if (foundCourse) {
        currentCourse.value = foundCourse;
      } else {
        error.value = 'Course not found';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch course details';
      error.value = message;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new course
   */
  async function createCourse(courseData: CourseRequest): Promise<Course | null> {
    if (!authStore.isTeacher) {
      error.value = 'Only teachers can create courses';
      return null;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a new course with mock ID (in production, ID would come from backend)
      const newCourse: Course = {
        id: Math.max(...mockCourses.map(c => c.id)) + 1,
        ...courseData,
        teacher_id: authStore.user?.id as number
      };
      
      // Add to mock courses
      mockCourses.push(newCourse);
      
      // Update local state
      courses.value = mockCourses.filter(course => course.teacher_id === authStore.user?.id);
      filteredCourses.value = [...courses.value];
      
      return newCourse;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create course';
      error.value = message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update an existing course
   */
  async function updateCourse(courseId: number, courseData: CourseRequest): Promise<Course | null> {
    if (!authStore.isTeacher) {
      error.value = 'Only teachers can update courses';
      return null;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the course to update
      const courseIndex = mockCourses.findIndex(course => course.id === courseId);
      
      if (courseIndex === -1) {
        error.value = 'Course not found';
        return null;
      }
      
      // Check if the teacher owns this course
      if (mockCourses[courseIndex].teacher_id !== authStore.user?.id) {
        error.value = 'You can only update your own courses';
        return null;
      }
      
      // Update the course
      const updatedCourse: Course = {
        ...mockCourses[courseIndex],
        ...courseData
      };
      
      mockCourses[courseIndex] = updatedCourse;
      
      // Update local state
      courses.value = mockCourses.filter(course => course.teacher_id === authStore.user?.id);
      filteredCourses.value = [...courses.value];
      
      // Update current course if it's the one being edited
      if (currentCourse.value?.id === courseId) {
        currentCourse.value = updatedCourse;
      }
      
      return updatedCourse;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update course';
      error.value = message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a course
   */
  async function deleteCourse(courseId: number): Promise<boolean> {
    if (!authStore.isTeacher) {
      error.value = 'Only teachers can delete courses';
      return false;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the course to delete
      const courseIndex = mockCourses.findIndex(course => course.id === courseId);
      
      if (courseIndex === -1) {
        error.value = 'Course not found';
        return false;
      }
      
      // Check if the teacher owns this course
      if (mockCourses[courseIndex].teacher_id !== authStore.user?.id) {
        error.value = 'You can only delete your own courses';
        return false;
      }
      
      // Remove the course
      mockCourses.splice(courseIndex, 1);
      
      // Update local state
      courses.value = mockCourses.filter(course => course.teacher_id === authStore.user?.id);
      filteredCourses.value = [...courses.value];
      
      // Clear current course if it's the one being deleted
      if (currentCourse.value?.id === courseId) {
        currentCourse.value = null;
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete course';
      error.value = message;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Filter courses based on provided criteria
   */
  function filterCourses(filters: CourseFilters): void {
    // Start with all user's courses
    let result = [...courses.value];
    
    // Apply title filter
    if (filters.title) {
      const searchTerm = filters.title.toLowerCase();
      result = result.filter(course => 
        course.title.toLowerCase().includes(searchTerm) || 
        course.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply difficulty filter
    if (filters.difficulty) {
      result = result.filter(course => course.difficulty_rating === filters.difficulty);
    }
    
    // Apply date range filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(course => new Date(course.date) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      result = result.filter(course => new Date(course.date) <= toDate);
    }
    
    // Update filtered courses
    filteredCourses.value = result;
  }

  /**
   * Reset all filters
   */
  function resetFilters(): void {
    filteredCourses.value = [...courses.value];
  }

  return {
    // State
    courses,
    filteredCourses,
    currentCourse,
    isLoading,
    error,
    
    // Getters
    teacherCourses,
    sortedCourses,
    coursesByDifficulty,
    
    // Actions
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    filterCourses,
    resetFilters
  };
});