<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { User } from '../../interfaces/Auth';

// Define props
const props = defineProps({
  students: {
    type: Array as PropType<User[]>,
    default: () => []
  },
  classId: {
    type: Number,
    required: true
  }
});

// Computed properties
const hasStudents = computed(() => props.students.length > 0);

// Sort students by name alphabetically
const sortedStudents = computed(() => {
  return [...props.students].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
});

// Get initial letter of student name for avatar
const getInitial = (name: string): string => {
  return name.charAt(0).toUpperCase();
};
</script>

<template>
  <div class="student-list">
    <!-- Empty state -->
    <div v-if="!hasStudents" class="text-center py-4">
      <v-icon icon="mdi-account-school" size="large" color="grey-lighten-1" class="mb-2"></v-icon>
      <p class="text-medium-emphasis">No students are enrolled in this class yet.</p>
    </div>
    
    <!-- Students list -->
    <v-list v-else density="compact">
      <v-list-item
        v-for="student in sortedStudents"
        :key="student.id"
        :title="student.name"
        :subtitle="student.email"
      >
        <template v-slot:prepend>
          <v-avatar color="primary" size="36" class="me-3">
            <span class="text-caption font-weight-medium text-white">{{ getInitial(student.name) }}</span>
          </v-avatar>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<style scoped>
.student-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>