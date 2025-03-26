import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

// Import views
import DashboardView from '../views/DashBoardView.vue';
// import LoginView from '../views/LoginView.vue';
// import ClassDetailsView from '../views/ClassDetailsView.vue';
// import StudentDashboardView from '../views/StudentDashboardView.vue';

// Setup routes configuration
const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: LoginView,
  //   meta: { guest: true }
  // },
  // {
  //   path: '/classes/:id',
  //   name: 'ClassDetails',
  //   component: ClassDetailsView,
  //   props: true,
  //   meta: { requiresAuth: true }
  // },
  // {
  //   path: '/student',
  //   name: 'StudentDashboard',
  //   component: StudentDashboardView,
  //   meta: { requiresAuth: true, requiresStudent: true }
  // },
  {
    // Catch-all route for 404s
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes
});

// // Global navigation guard
// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore();
  
//   // Check if the route requires authentication
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
//   const requiresStudent = to.matched.some(record => record.meta.requiresStudent);
//   const requiresTeacher = to.matched.some(record => record.meta.requiresTeacher);
//   const isGuestRoute = to.matched.some(record => record.meta.guest);
  
//   // Route protection logic
//   if (requiresAuth && !authStore.isAuthenticated) {
//     // Redirect to login page if authentication is required but user is not authenticated
//     next('/login');
//   } else if (isGuestRoute && authStore.isAuthenticated) {
//     // Redirect to dashboard if user is already authenticated but trying to access guest routes
//     next('/');
//   } else if (requiresStudent && authStore.userRole !== 'student') {
//     // Redirect to dashboard if route requires student role but user is not a student
//     next('/');
//   } else if (requiresTeacher && authStore.userRole !== 'teacher') {
//     // Redirect to dashboard if route requires teacher role but user is not a teacher
//     next('/');
//   } else {
//     // Proceed to the requested route
//     next();
//   }
// });

export default router;