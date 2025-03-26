<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { Class, ClassWithRelations } from '../../interfaces/Class';

// Define props with TypeScript types for type safety
const props = defineProps({
  classItem: {
    type: Object as PropType<Class | ClassWithRelations>,
    required: true
  },
  isDragOver: {
    type: Boolean,
    default: false
  },
  isStudentView: {
    type: Boolean,
    default: false
  }
});

// Emit events for parent component interaction
const emit = defineEmits(['click', 'dragover', 'dragleave', 'drop']);

// Computed properties for displaying class information
const className = computed(() => props.classItem.name);
const sectionNumber = computed(() => props.classItem.section_number);

// Get course count if available
const courseCount = computed(() => {
  if ('courses' in props.classItem && Array.isArray(props.classItem.courses)) {
    return props.classItem.courses.length;
  }
  return 0;
});

// Get student count if available
const studentCount = computed(() => {
  if ('students' in props.classItem && Array.isArray(props.classItem.students)) {
    return props.classItem.students.length;
  }
  return 0;
});

// Class for card styling based on drag state
const cardClass = computed(() => {
  return {
    'elevation-4': props.isDragOver,
    'border-primary': props.isDragOver,
    'bg-light-blue-lighten-5': props.isDragOver
  };
});

// Event handlers with proper TypeScript typings
const handleDragOver = (event: DragEvent) => {
  // Prevent default to allow drop
  event.preventDefault();
  
  // Check if we should allow drop based on student view
  if (!props.isStudentView) {
    // Set the drop effect
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    
    emit('dragover', event);
  }
};

const handleDragLeave = (event: DragEvent) => {
  // Only emit if not in student view
  if (!props.isStudentView) {
    emit('dragleave', event);
  }
};

const handleDrop = (event: DragEvent) => {
  // Always prevent default for drop events
  event.preventDefault();
  
  // Only emit if not in student view
  if (!props.isStudentView) {
    console.log('[ClassCard] Drop event on:', props.classItem.name);
    emit('drop', event);
  }
};

const handleClick = () => {
  emit('click');
};
</script>

<template>
  <v-card
    :class="cardClass"
    @click="handleClick"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    class="class-card h-100"
    min-height="180px"
    :variant="isDragOver ? 'elevated' : 'outlined'"
    :border="isDragOver ? true : false"
  >
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-google-classroom" class="me-2" />
      {{ className }}
      <v-chip size="small" class="ms-2">{{ sectionNumber }}</v-chip>
    </v-card-title>
    
    <v-card-text>
      <div class="d-flex align-center mb-2">
        <v-icon icon="mdi-account-group" size="small" class="me-2" />
        <span>{{ studentCount }} Students</span>
      </div>
      
      <div class="d-flex align-center">
        <v-icon icon="mdi-book-open-page-variant" size="small" class="me-2" />
        <span>{{ courseCount }} Courses</span>
      </div>
    </v-card-text>
    
    <v-card-actions>
      <v-spacer></v-spacer>
      
      <v-btn
        variant="text"
        color="primary"
        size="small"
        icon="mdi-eye"
        @click.stop="handleClick"
      ></v-btn>
      
      <!-- Drop zone indicator for teacher view -->
      <span v-if="!isStudentView && isDragOver" class="text-caption text-primary">
        Drop course here
      </span>
    </v-card-actions>
    
    <!-- Visual indicator for drag over state -->
    <div v-if="isDragOver" class="drop-zone-overlay"></div>
  </v-card>
</template>

<style scoped>
.class-card {
  position: relative;
  transition: all 0.2s ease;
}

.class-card:hover {
  transform: translateY(-2px);
}

.border-primary {
  border: 2px dashed rgb(var(--v-theme-primary)) !important;
}

.drop-zone-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-radius: inherit;
  pointer-events: none;
}
</style>