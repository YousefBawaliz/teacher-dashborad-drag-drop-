<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';

// Initialize auth store
const authStore = useAuthStore();
const router = useRouter();

// Sidebar visibility state (for mobile responsiveness)
const isSidebarOpen = ref(true);

// Initialize authentication on component mount
onMounted(() => {
  authStore.initAuth();
});

// Computed properties for dynamic content based on user's role
const userRole = computed(() => authStore.userRole);
const userName = computed(() => authStore.currentUser?.name || 'User');

// Navigation links based on user role
const navLinks = computed(() => {
  const links = [
    { title: 'Dashboard', icon: 'mdi-view-dashboard', path: '/' }
  ];

  // Add role-specific links
  if (userRole.value === 'teacher') {
    links.push(
      { title: 'Classes', icon: 'mdi-google-classroom', path: '/classes' },
      { title: 'Courses', icon: 'mdi-book-open-variant', path: '/courses' }
    );
  } else if (userRole.value === 'student') {
    links.push(
      { title: 'My Courses', icon: 'mdi-book-open-variant', path: '/student/courses' }
    );
  }

  return links;
});

// Function to handle logout
const handleLogout = async () => {
  authStore.logout();
  await router.push('/login');
};

// Toggle sidebar visibility (for mobile)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
  <v-navigation-drawer
    v-model="isSidebarOpen"
    app
    class="sidebar"
    permanent
    color="primary"
    :expand-on-hover="false"
    :rail="false"
  >
    <!-- App title and logo section -->
    <div class="pa-4">
      <v-list-item
        title="Teacher Dashboard"
        subtitle="Manage classes and courses"
        class="mb-4"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-school" size="large" />
        </template>
      </v-list-item>
      <v-divider />
    </div>

    <!-- Navigation links -->
    <v-list nav density="compact">
      <v-list-item
        v-for="(link, index) in navLinks"
        :key="index"
        :to="link.path"
        :value="link.title"
        color="secondary"
        class="mb-1"
      >
        <template v-slot:prepend>
          <v-icon :icon="link.icon"></v-icon>
        </template>
        <v-list-item-title>{{ link.title }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <!-- User info and logout section -->
    <template v-slot:append>
      <div class="pa-2">
        <v-divider class="mb-2" />
        <v-list nav>
          <v-list-item>
            <template v-slot:prepend>
              <v-avatar color="secondary" class="me-2">
                <span class="text-h6 text-uppercase">{{ userName.charAt(0) }}</span>
              </v-avatar>
            </template>
            <v-list-item-title>{{ userName }}</v-list-item-title>
            <v-list-item-subtitle>{{ userRole }}</v-list-item-subtitle>
            <template v-slot:append>
              <v-btn icon variant="text" @click="handleLogout">
                <v-icon icon="mdi-logout" />
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}
</style>