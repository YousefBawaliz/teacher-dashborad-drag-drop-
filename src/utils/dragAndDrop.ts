/**
 * Utility functions for drag and drop operations in the teacher dashboard
 */
import type { Course } from '../interfaces/Course';
import type { Class } from '../interfaces/Class';

/**
 * Create a data transfer object for course drag operations
 * @param course The course being dragged
 * @param dataTransfer The DataTransfer object from the drag event
 */
export const setDragData = (course: Course, dataTransfer: DataTransfer): void => {
  // Set the data type and course ID
  dataTransfer.setData('application/json', JSON.stringify({
    type: 'course',
    id: course.id,
    title: course.title
  }));
  
  // Also set a fallback plain text version
  dataTransfer.setData('text/plain', `Course: ${course.title}`);
  
  // Set the allowed effect
  dataTransfer.effectAllowed = 'move';
};

/**
 * Retrieve course data from a drop event
 * @param dataTransfer The DataTransfer object from the drop event
 * @returns The course ID if valid data is found, null otherwise
 */
export const getCourseIdFromDrop = (dataTransfer: DataTransfer): number | null => {
  try {
    // Try to get the structured data first
    const jsonData = dataTransfer.getData('application/json');
    if (jsonData) {
      const data = JSON.parse(jsonData);
      if (data.type === 'course' && typeof data.id === 'number') {
        return data.id;
      }
    }
    
    // Fallback to text format that might contain the ID
    const textData = dataTransfer.getData('text/plain');
    if (textData) {
      // Extract ID from text if it's in the format "courseId:123"
      const match = textData.match(/courseId:(\d+)/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    return null;
  } catch (e) {
    console.error('Error parsing drag data:', e);
    return null;
  }
};

/**
 * Check if a class can accept a dropped course
 * @param classItem The target class
 * @param courseId The ID of the course being dropped
 * @returns True if the class can accept the course, false otherwise
 */
export const canClassAcceptCourse = (classItem: any, courseId: number): boolean => {
  if (!classItem || typeof classItem !== 'object') return false;
  
  // Check if the class already has this course
  if ('courses' in classItem && Array.isArray(classItem.courses)) {
    return !classItem.courses.some((course: Course) => course.id === courseId);
  }
  
  // If the class has no courses array yet, it can accept any course
  return true;
};

/**
 * Apply visual styling to highlight drop targets
 * @param element The element to style
 * @param isActive Whether the element is an active drop target
 */
export const applyDropTargetStyle = (element: HTMLElement, isActive: boolean): void => {
  if (isActive) {
    element.classList.add('drop-target-active');
  } else {
    element.classList.remove('drop-target-active');
  }
};