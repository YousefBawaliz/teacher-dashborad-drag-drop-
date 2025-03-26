<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppNavigation from '../components/layout/AppNavigation.vue';
import AppSidebar from '../components/layout/AppSidebar.vue';
import CourseCard from '../components/courses/CourseCard.vue';
import CourseForm from '../components/courses/CourseForm.vue';
import { useAuthStore } from '../stores/auth.store';
import { useCourseStore } from '../stores/course.store';
import type { Course, CourseRequest } from '../interfaces/Course';

// Initialize stores and router
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();

// Component state
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const showCreateForm = ref(false);
const selectedCourse = ref<Course | null>(null);

// Clear messages after a timeout
const clearMessages = () => {
  setTimeout(() => {
    errorMessage.value = null;
    successMessage.value = null;
  }, 3000);
};

// Fetch courses
const fetchCourses = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  
  try {
    await courseStore.fetchCourses();
  } catch (error) {
    errorMessage.value = error instanceof Error 
      ? error.message 
      : 'Failed to load courses. Please try again.';
    console.error('Error loading courses:', error);
  } finally {
    isLoading.value = false;
  }
};

// Computed properties
const courses = computed(() => {
  return courseStore.teacherCourses;
});

// Toggle course form
const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value;
  selectedCourse.value = null; // Clear selected course when toggling form
};

// Handle course creation
const handleCreateCourse = async (courseData: CourseRequest) => {
  try {
    const result = await courseStore.createCourse(courseData);
    if (result) {
      successMessage.value = `Course "${result.title}" created successfully.`;
      showCreateForm.value = false;
      await fetchCourses(); // Refresh course list
    } else {
      errorMessage.value = courseStore.error || 'Failed to create course.';
    }
    clearMessages();
  } catch (error) {
    errorMessage.value = error instanceof Error 
      ? error.message 
      : 'An error occurred while creating the course.';
    clearMessages();
  }
};

// Handle course selection for edit
const handleEditCourse = (course: Course) => {
  selectedCourse.value = course;
  showCreateForm.value = true;
};

// Handle course deletion
const handleDeleteCourse = async (courseId: number) => {
  if (!confirm('Are you sure you want to delete this course?')) {
    return;
  }
  
  try {
    const result = await courseStore.deleteCourse(courseId);
    if (result) {
      const courseName = courses.value.find(c => c.id === courseId)?.title || 'Course';
      successMessage.value = `${courseName} deleted successfully.`;
      if (selectedCourse.value?.id === courseId) {
        selectedCourse.value = null;
        showCreateForm.value = false;
      }
      await fetchCourses(); // Refresh course list
    } else {
      errorMessage.value = courseStore.error || 'Failed to delete course.';
    }
    clearMessages();
  } catch (error) {
    errorMessage.value = error instanceof Error 
      ? error.message 
      : 'An error occurred while deleting the course.';
    clearMessages();
  }
};

// Lifecycle hooks
onMounted(async () => {
  // Initialize auth state
  authStore.initAuth();
  
  // Fetch courses if authenticated
  if (authStore.isAuthenticated) {
    await fetchCourses();
  }
});

// Watch for auth state changes
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    router.push('/login');
  } else {
    fetchCourses();
  }
});
</script>

<template>
  <div class="courses-view-container">
    <AppSidebar />
    
    <div class="content-wrapper">
      <AppNavigation title="Courses" />
      
      <v-main>
        <v-container fluid class="pa-4">
          <!-- Loading state -->
          <v-row v-if="isLoading">
            <v-col cols="12" class="text-center">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="mt-4">Loading courses...</p>
            </v-col>
          </v-row>
          
          <!-- Error message -->
          <v-alert
            v-if="errorMessage && !isLoading"
            type="error"
            variant="tonal"
            closable
            class="mb-4"
            @click:close="errorMessage = null"
          >
            {{ errorMessage }}
          </v-alert>
          
          <!-- Success message -->
          <v-alert
            v-if="successMessage && !isLoading"
            type="success"
            variant="tonal"
            closable
            class="mb-4"
            @click:close="successMessage = null"
          >
            {{ successMessage }}
          </v-alert>
          
          <!-- Courses content -->
          <template v-if="!isLoading">
            <v-row>
              <v-col cols="12">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h1 class="text-h4">Your Courses</h1>
                  
                  <v-btn 
                    color="primary" 
                    prepend-icon="mdi-plus"
                    @click="toggleCreateForm"
                  >
                    {{ showCreateForm ? 'Cancel' : 'Create Course' }}
                  </v-btn>
                </div>
              </v-col>
            </v-row>
            
            <!-- Course Form -->
            <v-row v-if="showCreateForm">
              <v-col cols="12">
                <v-card variant="outlined" class="mb-6">
                  <v-card-title>
                    {{ selectedCourse ? 'Edit Course' : 'Create New Course' }}
                  </v-card-title>
                  <v-card-text>
                    <CourseForm 
                      :course="selectedCourse"
                      @submit="handleCreateCourse"
                      @cancel="toggleCreateForm"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            
            <!-- Empty state -->
            <v-row v-if="courses.length === 0 && !showCreateForm">
              <v-col cols="12">
                <v-alert type="info" variant="tonal">
                  You haven't created any courses yet. Use the "Create Course" button to get started.
                </v-alert>
              </v-col>
            </v-row>
            
            <!-- Courses grid -->
            <v-row v-else-if="!showCreateForm">
              <v-col 
                v-for="course in courses" 
                :key="course.id" 
                cols="12" 
                sm="6" 
                md="4" 
                lg="3"
              >
                <v-card class="h-100">
                  <CourseCard
                    :course="course"
                  />
                  <v-card-actions class="d-flex justify-end">
                    <v-btn
                      icon
                      variant="text"
                      color="primary"
                      size="small"
                      @click="handleEditCourse(course)"
                    >
                      <v-icon icon="mdi-pencil"></v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      variant="text"
                      color="error"
                      size="small"
                      @click="handleDeleteCourse(course.id)"
                    >
                      <v-icon icon="mdi-delete"></v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-container>
      </v-main>
    </div>
  </div>
</template>

<style scoped>
.courses-view-container {
  display: flex;
  min-height: 100vh;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>