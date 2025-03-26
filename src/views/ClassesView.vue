<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppNavigation from '../components/layout/AppNavigation.vue';
import AppSidebar from '../components/layout/AppSidebar.vue';
import ClassCard from '../components/classes/ClassCard.vue';
import { useAuthStore } from '../stores/auth.store';
import { useClassStore } from '../stores/class.store';
import type { Class, ClassWithRelations } from '../interfaces/Class';

// Initialize stores and router
const router = useRouter();
const authStore = useAuthStore();
const classStore = useClassStore();

// Component state
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);

// Fetch classes
const fetchClasses = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  
  try {
    await classStore.fetchClasses();
  } catch (error) {
    errorMessage.value = error instanceof Error 
      ? error.message 
      : 'Failed to load classes. Please try again.';
    console.error('Error loading classes:', error);
  } finally {
    isLoading.value = false;
  }
};

// Computed properties
const classes = computed(() => {
  return authStore.isTeacher ? classStore.teacherClasses : [];
});

// Handle class selection
const handleClassClick = (classItem: Class | ClassWithRelations) => {
  router.push(`/classes/${classItem.id}`);
};

// Lifecycle hooks
onMounted(async () => {
  // Initialize auth state
  authStore.initAuth();
  
  // Fetch classes if authenticated
  if (authStore.isAuthenticated) {
    await fetchClasses();
  }
});

// Watch for auth state changes
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    router.push('/login');
  } else {
    fetchClasses();
  }
});
</script>

<template>
  <div class="classes-view-container">
    <AppSidebar />
    
    <div class="content-wrapper">
      <AppNavigation title="Classes" />
      
      <v-main>
        <v-container fluid class="pa-4">
          <!-- Loading state -->
          <v-row v-if="isLoading">
            <v-col cols="12" class="text-center">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="mt-4">Loading classes...</p>
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
          
          <!-- Classes content -->
          <template v-if="!isLoading">
            <v-row>
              <v-col cols="12">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h1 class="text-h4">Your Classes</h1>
                  
                  <!-- Future enhancement: Add class button -->
                  <!-- <v-btn color="primary" prepend-icon="mdi-plus">Add Class</v-btn> -->
                </div>
              </v-col>
            </v-row>
            
            <!-- Empty state -->
            <v-row v-if="classes.length === 0">
              <v-col cols="12">
                <v-alert type="info" variant="tonal">
                  You don't have any classes assigned to you yet.
                </v-alert>
              </v-col>
            </v-row>
            
            <!-- Classes grid -->
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
                  @click="() => handleClassClick(classItem)"
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
.classes-view-container {
  display: flex;
  min-height: 100vh;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>