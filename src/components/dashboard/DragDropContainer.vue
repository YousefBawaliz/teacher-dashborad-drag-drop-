<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import type { Course } from '../../interfaces/Course';
import type { Class, ClassWithRelations } from '../../interfaces/Class';
import { canClassAcceptCourse } from '../../utils/dragAndDrop';
import { useClassStore } from '../../stores/class.store';
import { useCourseStore } from '../../stores/course.store';
import ClassCard from '../classes/ClassCard.vue';
import CourseCard from '../courses/CourseCard.vue';

// Initialize stores
const classStore = useClassStore();
const courseStore = useCourseStore();

// Props definition
const props = defineProps({
  courses: {
    type: Array as PropType<Course[]>,
    default: () => []
  },
  classes: {
    type: Array as PropType<Class[] | ClassWithRelations[]>,
    default: () => []
  }
});

// Emitted events
const emit = defineEmits(['classUpdated', 'error']);

// Component state
const draggingCourse = ref<Course | null>(null);
const dragOverClassId = ref<number | null>(null);
const dragError = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isLoading = ref(false);
const assignmentHistory = ref<Array<{courseId: number, classId: number, timestamp: number}>>([]);

// Computed properties
const hasError = computed(() => dragError.value !== null);
const hasSuccess = computed(() => successMessage.value !== null);

// Clear messages after a timeout
const clearMessages = () => {
  setTimeout(() => {
    dragError.value = null;
    successMessage.value = null;
  }, 3000);
};

// Logging helper
const logDebug = (message: string, ...data: any[]) => {
  console.log(`[DragDropContainer] ${message}`, ...data);
};

// Drag event handlers
const handleDragStart = (course: Course, event: DragEvent) => {
  logDebug('Drag start:', course);
  draggingCourse.value = course;
  
  // Set data transfer for better browser compatibility
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify({
      courseId: course.id,
      courseTitle: course.title
    }));
    
    // Also set plain text for fallback
    event.dataTransfer.setData('text/plain', `Course: ${course.title}`);
    
    // Add a class to the body for global styling during drag
    document.body.classList.add('dragging-active');
  }
  
  // Clear any previous messages
  dragError.value = null;
  successMessage.value = null;
};

const handleDragEnd = () => {
  logDebug('Drag end');
  draggingCourse.value = null;
  dragOverClassId.value = null;
  document.body.classList.remove('dragging-active');
};

const handleDragOver = (classId: number, event: DragEvent) => {
  event.preventDefault();
  
  if (!draggingCourse.value) return;
  
  // Find the target class
  const targetClass = props.classes.find(c => c.id === classId);
  
  // Check if this course can be added to this class
  if (targetClass && draggingCourse.value) {
    const canAccept = canClassAcceptCourse(targetClass, draggingCourse.value.id);
    
    if (canAccept) {
      dragOverClassId.value = classId;
      // Set the drop effect
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
    } else {
      // Course is already in this class
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'none';
      }
    }
  }
};

const handleDragLeave = () => {
  dragOverClassId.value = null;
};

const handleDrop = async (classId: number, event: DragEvent) => {
  event.preventDefault();
  logDebug('Drop event on class:', classId);
  
  // Find the target class first to ensure it exists
  const targetClass = props.classes.find(c => c.id === classId);
  if (!targetClass) {
    const errorMsg = `Target class with ID ${classId} not found`;
    logDebug(errorMsg);
    dragError.value = errorMsg;
    emit('error', dragError.value);
    clearMessages();
    return;
  }
  
  // Get or recover the dragging course
  let courseToAssign = draggingCourse.value;
  
  if (!courseToAssign) {
    // Try to get course from dataTransfer if direct reference is lost
    try {
      const jsonData = event.dataTransfer?.getData('application/json');
      logDebug('Retrieved JSON data:', jsonData);
      
      if (jsonData) {
        const data = JSON.parse(jsonData);
        if (data.courseId) {
          courseToAssign = props.courses.find(c => c.id === data.courseId) || null;
          logDebug('Found course from data transfer:', courseToAssign);
        }
      } else {
        // Try to get from plain text as fallback
        const textData = event.dataTransfer?.getData('text/plain');
        logDebug('Retrieved text data:', textData);
        
        if (textData && textData.startsWith('Course: ')) {
          // Find course by title
          const courseTitle = textData.replace('Course: ', '');
          courseToAssign = props.courses.find(c => c.title === courseTitle) || null;
          logDebug('Found course by title:', courseToAssign);
        }
      }
    } catch (e) {
      logDebug('Error parsing drop data:', e);
    }
  }
  
  if (!courseToAssign) {
    const errorMsg = 'Unable to determine which course was dropped';
    logDebug(errorMsg);
    dragError.value = errorMsg;
    emit('error', dragError.value);
    clearMessages();
    return;
  }
  
  isLoading.value = true;
  
  try {
    // Validate that the course can be added to this class
    if (!canClassAcceptCourse(targetClass, courseToAssign.id)) {
      const errorMsg = `Course "${courseToAssign.title}" is already assigned to this class`;
      logDebug(errorMsg);
      dragError.value = errorMsg;
      emit('error', dragError.value);
      clearMessages();
      return;
    }
    
    logDebug('Adding course to class:', { courseId: courseToAssign.id, classId });
    
    // Add the course to the class
    const result = await classStore.addCourseToClass({
      class_id: classId,
      course_id: courseToAssign.id
    });
    
    if (result) {
      // Record successful assignment
      assignmentHistory.value.push({
        courseId: courseToAssign.id,
        classId: classId,
        timestamp: Date.now()
      });
      
      successMessage.value = `Course "${courseToAssign.title}" successfully assigned to ${targetClass.name}`;
      emit('classUpdated', { classId, courseId: courseToAssign.id });
      clearMessages();
      logDebug('Successfully assigned course to class');
    } else {
      // If the store function returns false, it should have set an error message
      const errorMsg = classStore.error || 'Failed to assign course to class';
      logDebug(errorMsg);
      dragError.value = errorMsg;
      emit('error', dragError.value);
      clearMessages();
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'An error occurred during the drop operation';
    logDebug(errorMsg);
    dragError.value = errorMsg;
    emit('error', dragError.value);
    clearMessages();
  } finally {
    // Reset states
    handleDragEnd();
    isLoading.value = false;
  }
};

// Undo last assignment (could be expanded for more comprehensive history)
const undoLastAssignment = async () => {
  if (assignmentHistory.value.length === 0) return;
  
  const lastAssignment = assignmentHistory.value.pop();
  if (!lastAssignment) return;
  
  isLoading.value = true;
  
  try {
    const result = await classStore.removeCourseFromClass({
      class_id: lastAssignment.classId,
      course_id: lastAssignment.courseId
    });
    
    if (result) {
      successMessage.value = 'Last assignment undone successfully';
      emit('classUpdated', { classId: lastAssignment.classId, courseId: lastAssignment.courseId, action: 'remove' });
      clearMessages();
    } else {
      dragError.value = classStore.error || 'Failed to undo assignment';
      emit('error', dragError.value);
      clearMessages();
    }
  } catch (error) {
    dragError.value = error instanceof Error ? error.message : 'An error occurred while undoing the assignment';
    emit('error', dragError.value);
    clearMessages();
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  // Log the received props to help with debugging
  logDebug('Component mounted with props:', { 
    courses: props.courses.length, 
    classes: props.classes.length 
  });
  
  // Add event listener for escape key to cancel drag
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && draggingCourse.value) {
      handleDragEnd();
    }
  });
});

// Watch for store errors
watch(() => classStore.error, (newError) => {
  if (newError) {
    logDebug('Store error:', newError);
    dragError.value = newError;
    emit('error', dragError.value);
    clearMessages();
  }
});

// Additional debug watchers
watch(() => props.courses, (newCourses) => {
  logDebug('Courses updated:', newCourses.length);
}, { deep: true });

watch(() => props.classes, (newClasses) => {
  logDebug('Classes updated:', newClasses.length);
}, { deep: true });
</script>

<template>
  <div class="drag-drop-container">
    <!-- Debug info (can be removed in production) -->
    <div class="debug-info mb-4" v-if="false">
      <pre>Courses: {{ props.courses.length }}, Classes: {{ props.classes.length }}</pre>
      <pre v-if="draggingCourse">Dragging: {{ (draggingCourse as Course).title }}</pre>
    </div>
    
    <!-- Status messages -->
    <div class="status-messages">
      <v-alert
        v-if="hasError"
        type="error"
        variant="tonal"
        density="compact"
        closable
        class="mb-4"
        @click:close="dragError = null"
      >
        {{ dragError }}
      </v-alert>
      
      <v-alert
        v-if="hasSuccess"
        type="success"
        variant="tonal"
        density="compact"
        closable
        class="mb-4"
        @click:close="successMessage = null"
      >
        {{ successMessage }}
      </v-alert>
    </div>
    
    <!-- Classes grid (drop targets) -->
    <div class="mb-8">
      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h5">Your Classes</h2>
        
        <v-btn 
          v-if="assignmentHistory.length > 0"
          size="small"
          variant="text"
          color="primary"
          prepend-icon="mdi-undo"
          @click="undoLastAssignment"
          :disabled="isLoading"
        >
          Undo Last Assignment
        </v-btn>
      </div>
      
      <v-row v-if="props.classes.length === 0">
        <v-col cols="12">
          <v-alert type="info" variant="tonal">
            You don't have any classes assigned to you yet.
          </v-alert>
        </v-col>
      </v-row>
      
      <v-row v-else>
        <v-col 
          v-for="classItem in props.classes" 
          :key="classItem.id" 
          cols="12" 
          sm="6" 
          md="4" 
          lg="3"
        >
          <ClassCard
            :class-item="classItem"
            :is-drag-over="dragOverClassId === classItem.id"
            @dragover="(e) => handleDragOver(classItem.id, e)"
            @dragleave="handleDragLeave"
            @drop="(e) => handleDrop(classItem.id, e)"
          />
        </v-col>
      </v-row>
    </div>
    
    <!-- Courses grid (draggable items) -->
    <div>
      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h5">Your Courses</h2>
        
        <div class="text-caption" v-if="draggingCourse">
          <v-icon icon="mdi-drag" size="small" class="me-1"></v-icon>
          Dragging: {{ draggingCourse.title }}
        </div>
      </div>
      
      <v-row v-if="props.courses.length === 0">
        <v-col cols="12">
          <v-alert type="info" variant="tonal">
            You haven't created any courses yet.
          </v-alert>
        </v-col>
      </v-row>
      
      <v-row v-else>
        <v-col 
          v-for="course in props.courses" 
          :key="course.id" 
          cols="12" 
          sm="6" 
          md="4" 
          lg="3"
        >
          <CourseCard
            :course="course"
            @dragstart="(e) => handleDragStart(course, e)"
            @dragend="handleDragEnd"
          />
        </v-col>
      </v-row>
    </div>
    
    <!-- Instructions panel -->
    <v-card class="mt-8 bg-grey-lighten-4" variant="outlined">
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-icon icon="mdi-information-outline" color="info" class="me-2"></v-icon>
          <h3 class="text-subtitle-1 font-weight-medium">How to use drag and drop:</h3>
        </div>
        
        <ul class="pl-6 mb-0">
          <li>Drag a course card from the bottom section</li>
          <li>Drop it onto a class card in the top section</li>
          <li>The course will be assigned to that class</li>
          <li>You can undo your last assignment with the "Undo" button</li>
          <li>Press ESC key at any time to cancel a drag operation</li>
        </ul>
      </v-card-text>
    </v-card>
    
    <!-- Loading overlay -->
    <v-overlay
      :model-value="isLoading"
      class="align-center justify-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
      ></v-progress-circular>
    </v-overlay>
  </div>
</template>

<style scoped>
.drag-drop-container {
  margin: 20px 0;
  position: relative;
}

/* Global styles - added to document when dragging is active */
:global(.dragging-active) {
  cursor: grabbing !important;
}

:global(.dragging-active .v-card) {
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

:global(.dragging-active .class-card) {
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
}

/* Status messages container for animations */
.status-messages {
  position: sticky;
  top: 70px;
  z-index: 2;
}

/* Animations for drag elements */
.v-card[draggable=true] {
  transition: transform 0.2s, box-shadow 0.2s;
}

.v-card[draggable=true]:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
}
</style>
