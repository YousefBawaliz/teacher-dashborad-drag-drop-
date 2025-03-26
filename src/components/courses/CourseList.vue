<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { Course, DifficultyRating } from '../../interfaces/Course';

// Define props
const props = defineProps({
  courses: {
    type: Array as PropType<Course[]>,
    default: () => []
  },
  allowRemove: {
    type: Boolean,
    default: false
  },
  removingCourseId: {
    type: Number as PropType<number | null>,
    default: null
  }
});

// Define emits
const emit = defineEmits(['remove-course']);

// Computed properties
const hasCourses = computed(() => props.courses.length > 0);

// Sort courses by date (newest first)
const sortedCourses = computed(() => {
  return [...props.courses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});

// Format date in a readable format
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

// Get difficulty color based on rating
const getDifficultyColor = (difficulty: DifficultyRating): string => {
  const colorMap: Record<DifficultyRating, string> = {
    'easy': 'success',
    'medium': 'info',
    'hard': 'warning',
    'advanced': 'error'
  };
  
  return colorMap[difficulty] || 'grey';
};

// Handle remove course action
const handleRemoveCourse = (courseId: number) => {
  emit('remove-course', courseId);
};
</script>

<template>
  <div class="course-list">
    <!-- Empty state -->
    <div v-if="!hasCourses" class="text-center py-4">
      <v-icon icon="mdi-book-open-page-variant" size="large" color="grey-lighten-1" class="mb-2"></v-icon>
      <p class="text-medium-emphasis">No courses have been assigned to this class yet.</p>
    </div>
    
    <!-- Courses list -->
    <v-table v-else>
      <thead>
        <tr>
          <th>Course</th>
          <th>Date</th>
          <th>Total Marks</th>
          <th>Difficulty</th>
          <th v-if="allowRemove" class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="course in sortedCourses" :key="course.id">
          <td>
            <div class="d-flex align-center">
              <v-icon icon="mdi-book-open-variant" size="small" class="me-2"></v-icon>
              <div>
                <div class="font-weight-medium">{{ course.title }}</div>
                <div class="text-caption text-truncate" style="max-width: 250px;">
                  {{ course.description }}
                </div>
              </div>
            </div>
          </td>
          <td>{{ formatDate(course.date) }}</td>
          <td>{{ course.total_marks }}</td>
          <td>
            <v-chip
              :color="getDifficultyColor(course.difficulty_rating)"
              size="small"
              label
            >
              {{ course.difficulty_rating }}
            </v-chip>
          </td>
          <td v-if="allowRemove" class="text-center">
            <v-btn
              icon
              variant="text"
              color="error"
              size="small"
              :loading="removingCourseId === course.id"
              :disabled="removingCourseId !== null"
              @click="handleRemoveCourse(course.id)"
            >
              <v-icon icon="mdi-delete"></v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<style scoped>
.course-list {
  width: 100%;
}
</style>