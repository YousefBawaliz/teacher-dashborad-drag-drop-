<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth.store';

// Initialize auth store
const authStore = useAuthStore();

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'Teacher Dashboard'
  }
});

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userRole = computed(() => authStore.userRole);
const userInitial = computed(() => {
  const name = authStore.currentUser?.name || '';
  return name.charAt(0).toUpperCase();
});

// Mobile menu state
const mobileMenuOpen = ref(false);

// Handle mobile menu toggle
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// Current date formatted
const currentDate = computed(() => {
  const now = new Date();
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(now);
});
</script>

<template>
  <v-app-bar app color="white" elevation="1">
    <!-- Mobile menu toggle button (visible on small screens) -->
    <template v-slot:prepend>
      <v-app-bar-nav-icon
        variant="text"
        @click="toggleMobileMenu"
        class="d-flex d-md-none"
      ></v-app-bar-nav-icon>
    </template>

    <!-- Page title -->
    <v-app-bar-title>{{ props.title }}</v-app-bar-title>

    <!-- Right side content -->
    <template v-slot:append v-if="isAuthenticated">
      <!-- Date display (hidden on small screens) -->
      <div class="d-none d-md-flex align-center me-4">
        <v-icon icon="mdi-calendar" class="me-2" />
        <span>{{ currentDate }}</span>
      </div>

      <!-- User avatar and dropdown menu -->
      <v-menu location="bottom end">
        <template v-slot:activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            icon
            class="ms-2"
          >
            <v-avatar color="primary" size="32">
              <span class="text-body-1 font-weight-medium text-white">{{ userInitial }}</span>
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title>
              {{ authStore.currentUser?.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ userRole }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="authStore.logout">
            <template v-slot:prepend>
              <v-icon icon="mdi-logout"></v-icon>
            </template>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>

  <!-- Mobile menu (shown when mobileMenuOpen is true) -->
  <v-navigation-drawer
    v-model="mobileMenuOpen"
    temporary
    class="d-md-none"
    location="left"
  >
    <v-list>
      <v-list-item
        title="Dashboard"
        prepend-icon="mdi-view-dashboard"
        to="/"
      ></v-list-item>
      <template v-if="userRole === 'teacher'">
        <v-list-item
          title="Classes"
          prepend-icon="mdi-google-classroom"
          to="/classes"
        ></v-list-item>
        <v-list-item
          title="Courses"
          prepend-icon="mdi-book-open-variant"
          to="/courses"
        ></v-list-item>
      </template>
      <template v-else-if="userRole === 'student'">
        <v-list-item
          title="My Courses"
          prepend-icon="mdi-book-open-variant"
          to="/student/courses"
        ></v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>