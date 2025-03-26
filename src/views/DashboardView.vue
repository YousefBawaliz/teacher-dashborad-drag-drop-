<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppNavigation from '../components/layout/AppNavigation.vue';
import AppSidebar from '../components/layout/AppSidebar.vue';
import ClassCard from '../components/classes/ClassCard.vue';
import CourseCard from '../components/courses/CourseCard.vue';
import { useAuthStore } from '../stores/auth.store';
import { useClassStore } from '../stores/class.store';
import { useCourseStore } from '../stores/course.store';
import type { Course } from '../interfaces/Course';
import type { Class } from '../interfaces/Class';

// Initialize stores
const authStore = useAuthStore();
const classStore = useClassStore();
const courseStore = useCourseStore();
const router = useRouter();

// Loading states
const isLoading = ref(true);
const loadingMessage = ref('Loading dashboard...');

// Error handling
const errorMessage = ref('');
const hasError = computed(() => errorMessage.value !== '');

// Drag and drop state
const draggingCourse = ref<Course | null>(null);
const dragOverClassId = ref<number | null>(null);

// Setup dashboard data
onMounted(async () => {
  // Initialize authentication - auto-login is handled in App.vue for testing
  authStore.initAuth();
  
  // Load dashboard data - fetch classes and courses
  try {
    // For testing purposes, log the user to the console
    console.log("Current logged in user:", authStore.currentUser);
    
    // Load classes and courses in parallel
    console.log("Loading dashboard data...");
    const classesPromise = classStore.fetchClasses();
    const coursesPromise = courseStore.fetchCourses();
    
    await Promise.all([classesPromise, coursesPromise]);
    
    // Log the loaded data
    console.log("Loaded classes:", classStore.classes);
    console.log("Loaded courses:", courseStore.courses);
    console.log("Teacher classes:", classStore.teacherClasses);
    console.log("Teacher courses:", courseStore.teacherCourses);
    
    isLoading.value = false;
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    errorMessage.value = 'Failed to load dashboard data. Please try refreshing the page.';
    isLoading.value = false;
  }

  try {
    // Load classes and courses in parallel
    loadingMessage.value = 'Loading your classes...';
    const classesPromise = classStore.fetchClasses();
    
    loadingMessage.value = 'Loading your courses...';
    const coursesPromise = courseStore.fetchCourses();
    
    await Promise.all([classesPromise, coursesPromise]);
    isLoading.value = false;
  } catch (error) {
    errorMessage.value = 'Failed to load dashboard data. Please try refreshing the page.';
    isLoading.value = false;
  }
});

// Watch for auth state changes
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    router.push('/login');
  }
});

// Computed properties for classes and courses
const classes = computed(() => {
  return authStore.isTeacher ? classStore.teacherClasses : classStore.studentClasses;
});

const courses = computed(() => {
  return authStore.isTeacher ? courseStore.teacherCourses : [];
});

// Student dashboard specific computed property
const studentCourses = computed(() => {
  if (!authStore.isStudent) return [];
  
  // Flatten all courses from all classes the student is enrolled in
  const allCourses: Course[] = [];
  classes.value.forEach(classItem => {
    // The class store should handle this mapping in a real implementation
    const classWithCourses = classStore.classes.find(c => c.id === classItem.id);
    if (classWithCourses && 'courses' in classWithCourses) {
      const coursesArray = (classWithCourses as any).courses || [];
      allCourses.push(...coursesArray);
    }
  });
  
  return allCourses;
});

// Drag and drop handlers
const handleDragStart = (course: Course, event: DragEvent) => {
  draggingCourse.value = course;
  
  // Set data transfer for drag operation
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', course.id.toString());
    event.dataTransfer.setData('application/json', JSON.stringify({
      courseId: course.id,
      courseTitle: course.title
    }));
  }
};

const handleDragEnd = () => {
  draggingCourse.value = null;
  dragOverClassId.value = null;
};

const handleDragOver = (classId: number, event: DragEvent) => {
  event.preventDefault();
  dragOverClassId.value = classId;
};

const handleDragLeave = () => {
  dragOverClassId.value = null;
};

const handleDrop = async (classId: number, event: DragEvent) => {
  event.preventDefault();
  
  let courseToAssign = draggingCourse.value;
  
  // If draggingCourse is null, try to get course ID from dataTransfer
  if (!courseToAssign && event.dataTransfer) {
    try {
      // Try to get the data from dataTransfer
      const jsonData = event.dataTransfer.getData('application/json');
      if (jsonData) {
        const data = JSON.parse(jsonData);
        const courseId = data.courseId;
        courseToAssign = courses.value.find(c => c.id === courseId) || null;
      } else {
        // Fallback to plain text
        const courseId = parseInt(event.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(courseId)) {
          courseToAssign = courses.value.find(c => c.id === courseId) || null;
        }
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  }
  
  if (!courseToAssign) {
    console.error('Failed to determine which course to assign');
    errorMessage.value = 'Failed to assign course to class. Could not determine course.';
    return;
  }
  
  try {
    // Assign the course to the class
    await classStore.addCourseToClass({
      class_id: classId,
      course_id: courseToAssign.id
    });
    
    // Show success message
    console.log(`Course "${courseToAssign.title}" added to class ID ${classId}`);
  } catch (error) {
    console.error('Failed to assign course to class:', error);
    errorMessage.value = 'Failed to assign course to class. Please try again.';
  } finally {
    // Reset drag state
    handleDragEnd();
  }
};

// Utility function to determine if a course is already assigned to a class
const isCourseInClass = (courseId: number, classItem: any): boolean => {
  if (!classItem || !('courses' in classItem)) return false;
  
  const coursesArray = (classItem as any).courses || [];
  return coursesArray.some((course: Course) => course.id === courseId);
};

// View class details
const viewClassDetails = (classId: number) => {
  router.push(`/classes/${classId}`);
};

// Create new course (redirect to course form)
const createNewCourse = () => {
  router.push('/courses/new');
};
</script>

<template>
  <div class="dashboard-container">
  <AppSidebar />
  
  <div class="content-wrapper">
    <AppNavigation :title="authStore.isTeacher ? 'Teacher Dashboard' : 'Student Dashboard'" />
    
    <v-main>
      <v-container fluid class="pa-4">
        <!-- Loading state -->
        <v-row v-if="isLoading">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="mt-4">{{ loadingMessage }}</p>
          </v-col>
        </v-row>
        
        <!-- Error message -->
        <v-alert
          v-if="hasError && !isLoading"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>
        
        <!-- Teacher Dashboard -->
        <template v-if="!isLoading && authStore.isTeacher">
          <!-- Welcome message -->
          <v-row>
            <v-col cols="12">
              <h1 class="text-h4 mb-2">Welcome, {{ authStore.currentUser?.name }}!</h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Manage your classes and courses from this dashboard. Drag courses onto classes to assign them.
              </p>
            </v-col>
          </v-row>
          
          <!-- Classes section -->
          <v-row>
            <v-col cols="12">
              <h2 class="text-h5 mb-3">Your Classes</h2>
            </v-col>
          </v-row>
          
          <v-row v-if="classes.length === 0">
            <v-col cols="12">
              <v-alert type="info" variant="tonal">
                You don't have any classes assigned to you yet.
              </v-alert>
            </v-col>
          </v-row>
          
          <v-row v-else>
            <v-col 
              v-for="classItem in classes" 
              :key="classItem.id" 
              cols="12" 
              sm="6" 
              md="4" 
              lg="3"
              class="class-card-container"
            >
              <ClassCard 
                :class-item="classItem"
                :is-drag-over="dragOverClassId === classItem.id"
                @click="viewClassDetails(classItem.id)"
                @dragover="(e) => handleDragOver(classItem.id, e)"
                @dragleave="handleDragLeave"
                @drop="(e) => handleDrop(classItem.id, e)"
              />
            </v-col>
          </v-row>
          
          <!-- Courses section -->
          <v-row class="mt-6">
            <v-col cols="12" class="d-flex justify-space-between align-center">
              <h2 class="text-h5">Your Courses</h2>
              <v-btn 
                color="primary" 
                prepend-icon="mdi-plus"
                @click="createNewCourse"
              >
                New Course
              </v-btn>
            </v-col>
          </v-row>
          
          <v-row v-if="courses.length === 0">
            <v-col cols="12">
              <v-alert type="info" variant="tonal">
                You haven't created any courses yet. Click the "New Course" button to get started.
              </v-alert>
            </v-col>
          </v-row>
          
          <v-row v-else class="course-card-container">
            <v-col 
              v-for="course in courses" 
              :key="course.id" 
              cols="12" 
              sm="6" 
              md="4" 
              lg="3"
            >
              <CourseCard 
                :course="course"
                draggable="true"
                @dragstart="(e) => handleDragStart(course, e)"
                @dragend="handleDragEnd"
              />
            </v-col>
          </v-row>
          
          <!-- Drag and drop instructions -->
          <v-row v-if="courses.length > 0 && classes.length > 0" class="mt-6">
            <v-col cols="12">
              <v-alert type="info" icon="mdi-information-outline" variant="tonal">
                <strong>Tip:</strong> Drag a course card and drop it onto a class card to assign the course to that class.
              </v-alert>
            </v-col>
          </v-row>
        </template>
        
        <!-- Student Dashboard -->
        <template v-if="!isLoading && authStore.isStudent">
          <!-- Welcome message -->
          <v-row>
            <v-col cols="12">
              <h1 class="text-h4 mb-2">Welcome, {{ authStore.currentUser?.name }}!</h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                View your enrolled classes and assigned courses below.
              </p>
            </v-col>
          </v-row>
          
          <!-- Enrolled classes section -->
          <v-row>
            <v-col cols="12">
              <h2 class="text-h5 mb-3">Your Classes</h2>
            </v-col>
          </v-row>
          
          <v-row v-if="classes.length === 0">
            <v-col cols="12">
              <v-alert type="info" variant="tonal">
                You are not enrolled in any classes yet.
              </v-alert>
            </v-col>
          </v-row>
          
          <v-row v-else>
            <v-col 
              v-for="classItem in classes" 
              :key="classItem.id" 
              cols="12" 
              sm="6" 
              md="4" 
              lg="3"
            >
              <ClassCard 
                :class-item="classItem"
                :is-student-view="true"
                @click="viewClassDetails(classItem.id)"
              />
            </v-col>
          </v-row>
          
          <!-- Courses section -->
          <v-row class="mt-6">
            <v-col cols="12">
              <h2 class="text-h5 mb-3">Your Courses</h2>
            </v-col>
          </v-row>
          
          <v-row v-if="studentCourses.length === 0">
            <v-col cols="12">
              <v-alert type="info" variant="tonal">
                You don't have any assigned courses yet.
              </v-alert>
            </v-col>
          </v-row>
          
          <v-row v-else>
            <v-col 
              v-for="course in studentCourses" 
              :key="course.id" 
              cols="12" 
              sm="6" 
              md="4" 
              lg="3"
            >
              <CourseCard 
                :course="course"
                :is-student-view="true"
              />
            </v-col>
          </v-row>
        </template>
      </v-container>
    </v-main>
  </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.class-card-container [draggable="true"] {
  cursor: grab;
}

.class-card-container [draggable="true"]:active {
  cursor: grabbing;
}

.course-card-container [draggable="true"] {
  cursor: grab;
}

.course-card-container [draggable="true"]:active {
  cursor: grabbing;
}
</style>