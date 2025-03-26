<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppNavigation from '../layout/AppNavigation.vue';
import AppSidebar from '../layout/AppSidebar.vue';
import StudentList from './StudentList.vue';
import CourseList from '../courses/CourseList.vue';
import { useAuthStore } from '../../stores/auth.store';
import { useClassStore } from '../../stores/class.store';
import { useCourseStore } from '../../stores/course.store';
import type { ClassCourseOperation } from '../../interfaces/Class';

// Initialize stores and router
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const classStore = useClassStore();
const courseStore = useCourseStore();

// Get class ID from route params and convert to number
const classId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id, 10) : 0;
});

// Component state
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const removingCourseId = ref<number | null>(null);

// Clear messages after a timeout
const clearMessages = () => {
  setTimeout(() => {
    errorMessage.value = null;
    successMessage.value = null;
  }, 3000);
};

// Computed property for current class
const currentClass = computed(() => classStore.currentClass);

// Load class data
const loadClassData = async () => {
  if (!authStore.isAuthenticated || !classId.value) {
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;

  try {
    // Fetch class details including students and courses
    await classStore.fetchClassById(classId.value);
    
    if (!classStore.currentClass) {
      errorMessage.value = 'Class not found or you do not have access to it.';
      router.push('/');
    }
  } catch (error) {
    errorMessage.value = error instanceof Error 
      ? error.message 
      : 'Failed to load class details. Please try again.';
    console.error('Error loading class details:', error);
  } finally {
    isLoading.value = false;
  }
};

// Remove a course from the class
const removeCourse = async (courseId: number) => {
  if (!classId.value || !courseId) return;
  
  removingCourseId.value = courseId;
  
  try {
    const operation: ClassCourseOperation = {
      class_id: classId.value,
      course_id: courseId
    };
    
    const result = await classStore.removeCourseFromClass(operation);
    
    if (result) {
      successMessage.value = 'Course removed successfully.';
      // Refresh data after removal
      await loadClassData();
    } else {
      errorMessage.value = classStore.error || 'Failed to remove course from class.';
    }
    
    clearMessages();
  } catch (error) {
    errorMessage.value = error instanceof Error 
      ? error.message 
      : 'An error occurred while removing the course.';
    clearMessages();
  } finally {
    removingCourseId.value = null;
  }
};

// Navigate back to dashboard
const goBackToDashboard = () => {
  router.push('/');
};

// Lifecycle hooks
onMounted(async () => {
  // Initialize auth state - in case of direct navigation to this page
  authStore.initAuth();
  
  // Load class data if authenticated
  if (authStore.isAuthenticated) {
    await loadClassData();
  }
});

// Watch for auth state changes
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    router.push('/login');
  }
});

// Watch for class ID changes in the route
watch(() => classId.value, async (newClassId) => {
  if (newClassId) {
    await loadClassData();
  }
});
</script>

<template>
  <div class="class-details-container">
    <AppSidebar />
    
    <div class="content-wrapper">
      <AppNavigation :title="currentClass?.name || 'Class Details'" />
      
      <v-main>
        <v-container fluid class="pa-4">
          <!-- Loading state -->
          <v-row v-if="isLoading">
            <v-col cols="12" class="text-center">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="mt-4">Loading class details...</p>
            </v-col>
          </v-row>
          
          <!-- Error message -->
          <v-alert
            v-if="errorMessage"
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
            v-if="successMessage"
            type="success"
            variant="tonal"
            closable
            class="mb-4"
            @click:close="successMessage = null"
          >
            {{ successMessage }}
          </v-alert>
          
          <!-- Class details content -->
          <template v-if="!isLoading && currentClass">
            <!-- Header with back button -->
            <div class="d-flex align-center mb-6">
              <v-btn
                icon
                variant="text"
                @click="goBackToDashboard"
                class="me-2"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <h1 class="text-h4">
                {{ currentClass.name }}
                <v-chip class="ms-2" color="primary" size="small">
                  Section {{ currentClass.section_number }}
                </v-chip>
              </h1>
            </div>
            
            <v-row>
              <!-- Students section -->
              <v-col cols="12" md="5" lg="4">
                <v-card class="mb-4" variant="outlined">
                  <v-card-title class="d-flex align-center">
                    <v-icon icon="mdi-account-group" class="me-2" />
                    Students
                    <v-chip class="ms-2" size="small">
                      {{ currentClass.students?.length || 0 }}
                    </v-chip>
                  </v-card-title>
                  
                  <v-divider></v-divider>
                  
                  <v-card-text>
                    <StudentList 
                      :students="currentClass.students || []" 
                      :class-id="classId"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
              
              <!-- Courses section -->
              <v-col cols="12" md="7" lg="8">
                <v-card variant="outlined">
                  <v-card-title class="d-flex align-center">
                    <v-icon icon="mdi-book-open-variant" class="me-2" />
                    Assigned Courses
                    <v-chip class="ms-2" size="small">
                      {{ currentClass.courses?.length || 0 }}
                    </v-chip>
                  </v-card-title>
                  
                  <v-divider></v-divider>
                  
                  <v-card-text>
                    <CourseList 
                      :courses="currentClass.courses || []"
                      :removing-course-id="removingCourseId"
                      :allow-remove="true"
                      @remove-course="removeCourse"
                    />
                  </v-card-text>
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
.class-details-container {
  display: flex;
  min-height: 100vh;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>