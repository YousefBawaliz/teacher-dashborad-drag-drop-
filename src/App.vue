<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth.store';
import { useRoute, useRouter } from 'vue-router';

// Initialize auth store to check for existing session
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// Check authentication status on app mount
onMounted(async () => {
  console.log('App.vue mounted');
  
  // Initialize auth first
  authStore.initAuth();
  console.log('Auth initialized, authenticated:', authStore.isAuthenticated);
  
  // For testing: Auto-login as teacher
  if (!authStore.isAuthenticated) {
    console.log('Not authenticated, logging in as teacher...');
    
    // Login as teacher
    const loginResult = await authStore.login({
      email: 'teacher@example.com',
      password: 'password'
    });
    
    console.log('Login result:', loginResult);
    console.log('Auto-logged in as teacher for testing');
    console.log('Current user:', authStore.user);
    console.log('Is authenticated:', authStore.isAuthenticated);
  }
  
  // Always redirect to dashboard for testing
  if (route.path !== '/') {
    console.log('Redirecting to dashboard');
    router.push('/');
  }
});
</script>

<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<style>
/* Global styles */
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

/* Utility classes */
.cursor-pointer {
  cursor: pointer;
}

.cursor-grab {
  cursor: grab;
}

.cursor-grabbing {
  cursor: grabbing !important;
}
</style>