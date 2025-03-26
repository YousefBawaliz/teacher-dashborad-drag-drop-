<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth.store';
import { useRoute, useRouter } from 'vue-router';

// Initialize auth store to check for existing session
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// Check authentication status on app mount
onMounted(() => {
  // Initialize auth from localStorage if available
  authStore.initAuth();
  
  // For testing DashboardView, we'll skip auth checks
  // const isLoginPage = route.path === '/login';
  
  // if (!authStore.isAuthenticated && !isLoginPage) {
  //   // Redirect to login if not authenticated
  //   router.push('/login');
  // } else if (authStore.isAuthenticated && isLoginPage) {
  //   // Redirect to dashboard if already authenticated
  //   router.push('/');
  // }
});
</script>

<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<style>
/* Essential styles only */
:root {
  --app-background: #f5f7fa;
}

html, body {
  background-color: var(--app-background);
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Roboto', sans-serif;
}

/* Commented out utility classes as they might be used elsewhere
.cursor-pointer {
  cursor: pointer;
}

.cursor-grab {
  cursor: grab;
}

.cursor-grabbing {
  cursor: grabbing !important;
} */
</style>
