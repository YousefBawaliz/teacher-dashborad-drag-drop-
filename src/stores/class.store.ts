import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { type Class, type ClassWithRelations, type ClassState, type ClassCourseOperation } from '../interfaces/Class';
import { useAuthStore } from './auth.store';
import { type Course } from '../interfaces/Course';
import { type User } from '../interfaces/Auth';

/**
 * Class store for managing class data and operations
 * In production, this would interact with the actual class API
 */
export const useClassStore = defineStore('class', () => {
  // State
  const classes = ref<Class[]>([]);
  const currentClass = ref<ClassWithRelations | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Get auth store for user information
  const authStore = useAuthStore();

  // Mock data for development (would be removed in production)
  const mockStudents: User[] = [
    { id: 4, email: 'student1@example.com', name: 'Emily Parker', role: 'student' },
    { id: 5, email: 'student2@example.com', name: 'Michael Brown', role: 'student' },
    { id: 6, email: 'student3@example.com', name: 'Sophia Wilson', role: 'student' },
    { id: 7, email: 'student4@example.com', name: 'Daniel Lee', role: 'student' },
    { id: 8, email: 'student5@example.com', name: 'Olivia Martinez', role: 'student' },
    { id: 9, email: 'student6@example.com', name: 'James Taylor', role: 'student' }
  ];

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
    }
  ];

  const mockClasses: ClassWithRelations[] = [
    {
      id: 1,
      name: 'Mathematics 101',
      section_number: 'A',
      teacher_id: 1,
      students: [mockStudents[0], mockStudents[1], mockStudents[2]],
      courses: [mockCourses[0]]
    },
    {
      id: 2,
      name: 'Physics 201',
      section_number: 'B',
      teacher_id: 1,
      students: [mockStudents[1], mockStudents[3], mockStudents[4]],
      courses: [mockCourses[1]]
    },
    {
      id: 3,
      name: 'Literature 101',
      section_number: 'C',
      teacher_id: 3,
      students: [mockStudents[0], mockStudents[2], mockStudents[5]],
      courses: [mockCourses[2]]
    }
  ];

  // Getters
  const teacherClasses = computed(() => {
    if (!authStore.user) return [];
    return classes.value.filter(c => c.teacher_id === authStore.user?.id);
  });

  const studentClasses = computed(() => {
    if (!authStore.user || authStore.user.role !== 'student') return [];
    
    // In a real app, this would be filtered based on the student's enrolled classes
    // For mock data, we'll return classes that have this student
    return mockClasses.filter(c => 
      c.students?.some(student => student.id === authStore.user?.id)
    );
  });

  // Actions
 /**
   * Fetch all classes for the current teacher
   */
 async function fetchClasses(): Promise<void> {
  if (!authStore.isAuthenticated) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Debug user data
    console.log('Auth store user in fetchClasses:', authStore.user);
    console.log('Is teacher?', authStore.isTeacher);
    console.log('User ID:', authStore.user?.id);
    
    // Mock API response (replace with actual API call in production)
    if (authStore.isTeacher) {
      // For testing: Make sure to copy the mock data to avoid reference issues
      classes.value = JSON.parse(JSON.stringify(
        mockClasses.filter(c => c.teacher_id === authStore.user?.id)
      ));
      
      console.log('Filtered classes for teacher:', classes.value);
    } else {
      // For students, find classes they're enrolled in
      classes.value = JSON.parse(JSON.stringify(
        mockClasses.filter(c => 
          c.students?.some(student => student.id === authStore.user?.id)
        )
      ));
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch classes';
    error.value = message;
    console.error('Error fetching classes:', err);
  } finally {
    isLoading.value = false;
  }
}

  /**
   * Fetch a specific class by ID
   */
  async function fetchClassById(classId: number): Promise<void> {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock API response (replace with actual API call in production)
      const foundClass = mockClasses.find(c => c.id === classId);
      
      if (foundClass) {
        currentClass.value = foundClass;
      } else {
        error.value = 'Class not found';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch class details';
      error.value = message;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Add a course to a class (for drag-and-drop functionality)
   */
  async function addCourseToClass(operation: ClassCourseOperation): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the class and course
      const classToUpdate = mockClasses.find(c => c.id === operation.class_id);
      const courseToAdd = mockCourses.find(c => c.id === operation.course_id);
      
      if (!classToUpdate || !courseToAdd) {
        error.value = 'Class or course not found';
        return false;
      }
      
      // Check if course is already assigned to this class
      if (classToUpdate.courses?.some(c => c.id === courseToAdd.id)) {
        error.value = 'Course is already assigned to this class';
        return false;
      }
      
      // Add the course to the class
      if (!classToUpdate.courses) {
        classToUpdate.courses = [];
      }
      classToUpdate.courses.push(courseToAdd);
      
      // Update the current class if it's the one being modified
      if (currentClass.value?.id === operation.class_id) {
        currentClass.value = { ...classToUpdate };
      }
      
      // Update the classes list
      classes.value = [...mockClasses];
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add course to class';
      error.value = message;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Remove a course from a class
   */
  async function removeCourseFromClass(operation: ClassCourseOperation): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the class
      const classToUpdate = mockClasses.find(c => c.id === operation.class_id);
      
      if (!classToUpdate || !classToUpdate.courses) {
        error.value = 'Class not found or has no courses';
        return false;
      }
      
      // Filter out the course to remove
      classToUpdate.courses = classToUpdate.courses.filter(c => c.id !== operation.course_id);
      
      // Update the current class if it's the one being modified
      if (currentClass.value?.id === operation.class_id) {
        currentClass.value = { ...classToUpdate };
      }
      
      // Update the classes list
      classes.value = [...mockClasses];
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove course from class';
      error.value = message;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    classes,
    currentClass,
    isLoading,
    error,
    
    // Getters
    teacherClasses,
    studentClasses,
    
    // Actions
    fetchClasses,
    fetchClassById,
    addCourseToClass,
    removeCourseFromClass
  };
});