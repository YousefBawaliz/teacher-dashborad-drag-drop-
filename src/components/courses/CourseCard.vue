<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { Course, DifficultyRating } from '../../interfaces/Course';

// Define props with TypeScript types
const props = defineProps({
  course: {
    type: Object as PropType<Course>,
    required: true
  },
  isStudentView: {
    type: Boolean,
    default: false
  }
});

// Emit events for parent component interaction
const emit = defineEmits(['dragstart', 'dragend']);

// Computed properties for displaying course information
const courseTitle = computed(() => props.course.title);
const courseDate = computed(() => {
  try {
    const date = new Date(props.course.date);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return props.course.date;
  }
});

// Get difficulty color based on rating
const difficultyColor = computed(() => {
  const colorMap: Record<DifficultyRating, string> = {
    'easy': 'success',
    'medium': 'info',
    'hard': 'warning',
    'advanced': 'error'
  };
  
  return colorMap[props.course.difficulty_rating] || 'grey';
});

// Handle drag start event
const handleDragStart = (event: DragEvent) => {
  if (props.isStudentView) {
    // Prevent dragging in student view
    event.preventDefault();
    return;
  }
  
  // Set data transfer for drag operation
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', props.course.id.toString());
    
    // Add a ghost image (optional)
    const dragImage = event.target as HTMLElement;
    if (dragImage && event.dataTransfer) {
      event.dataTransfer.setDragImage(dragImage, 20, 20);
    }
  }
  
  emit('dragstart', event);
};

// Handle drag end event
const handleDragEnd = (event: DragEvent) => {
  if (!props.isStudentView) {
    emit('dragend', event);
  }
};
</script>

<template>
  <v-card
    class="course-card h-100"
    variant="outlined"
    :draggable="!isStudentView"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    min-height="180px"
  >
    <v-card-item>
      <template v-slot:prepend>
        <v-icon icon="mdi-book-open-variant" size="large"></v-icon>
      </template>
      
      <v-card-title>{{ courseTitle }}</v-card-title>
      
      <template v-slot:append>
        <v-chip
          :color="difficultyColor"
          size="small"
          label
        >
          {{ props.course.difficulty_rating }}
        </v-chip>
      </template>
    </v-card-item>
    
    <v-card-text>
      <p v-if="props.course.description" class="text-truncate mb-2">
        {{ props.course.description }}
      </p>
      
      <div class="d-flex align-center mb-1">
        <v-icon icon="mdi-calendar" size="small" class="me-2"></v-icon>
        <span class="text-caption">{{ courseDate }}</span>
      </div>
      
      <div class="d-flex align-center">
        <v-icon icon="mdi-star" size="small" class="me-2"></v-icon>
        <span class="text-caption">{{ props.course.total_marks }} marks</span>
      </div>
    </v-card-text>
    
    <v-card-actions>
      <v-spacer></v-spacer>
      
      <template v-if="!isStudentView">
        <v-tooltip text="Drag to assign to a class">
          <template v-slot:activator="{ props: tooltipProps }">
            <v-icon
              v-bind="tooltipProps"
              icon="mdi-drag"
              size="small"
              class="drag-handle"
            ></v-icon>
          </template>
        </v-tooltip>
      </template>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.course-card {
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-2px);
}

.course-card[draggable=true] {
  cursor: grab;
}

.course-card[draggable=true]:active {
  cursor: grabbing;
}

.drag-handle {
  opacity: 0.6;
}

.course-card:hover .drag-handle {
  opacity: 1;
}
</style>