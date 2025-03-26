<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { PropType } from 'vue';
import type { Course, CourseRequest, DifficultyRating } from '../../interfaces/Course';

// Define props
const props = defineProps({
  course: {
    type: Object as PropType<Course | null>,
    default: null
  }
});

// Define emits
const emit = defineEmits(['submit', 'cancel']);

// Form data
const title = ref('');
const description = ref('');
const date = ref('');
const totalMarks = ref<number>(100);
const difficultyRating = ref<DifficultyRating>('medium');

// Form validation
const errors = ref({
  title: '',
  description: '',
  date: '',
  totalMarks: ''
});

// Check if this is an edit operation
const isEditMode = computed(() => !!props.course);

// Available difficulty options
const difficultyOptions = [
  { title: 'Easy', value: 'easy' },
  { title: 'Medium', value: 'medium' },
  { title: 'Hard', value: 'hard' },
  { title: 'Advanced', value: 'advanced' }
];

// Format date for input (YYYY-MM-DD)
const formatDateForInput = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

// Initialize form with course data if editing
onMounted(() => {
  if (props.course) {
    title.value = props.course.title;
    description.value = props.course.description;
    date.value = formatDateForInput(props.course.date);
    totalMarks.value = props.course.total_marks;
    difficultyRating.value = props.course.difficulty_rating;
  } else {
    // Set default date to today if creating a new course
    const today = new Date();
    date.value = today.toISOString().split('T')[0];
  }
});

// Validate the form
const validateForm = (): boolean => {
  let isValid = true;
  
  // Reset errors
  errors.value = {
    title: '',
    description: '',
    date: '',
    totalMarks: ''
  };
  
  // Validate title
  if (!title.value.trim()) {
    errors.value.title = 'Title is required';
    isValid = false;
  } else if (title.value.length > 100) {
    errors.value.title = 'Title must be less than 100 characters';
    isValid = false;
  }
  
  // Validate description
  if (!description.value.trim()) {
    errors.value.description = 'Description is required';
    isValid = false;
  }
  
  // Validate date
  if (!date.value) {
    errors.value.date = 'Date is required';
    isValid = false;
  }
  
  // Validate total marks
  if (!totalMarks.value || totalMarks.value <= 0) {
    errors.value.totalMarks = 'Total marks must be greater than 0';
    isValid = false;
  } else if (totalMarks.value > 1000) {
    errors.value.totalMarks = 'Total marks must be less than 1000';
    isValid = false;
  }
  
  return isValid;
};

// Handle form submission
const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }
  
  const courseData: CourseRequest = {
    title: title.value,
    description: description.value,
    date: date.value,
    total_marks: totalMarks.value,
    difficulty_rating: difficultyRating.value
  };
  
  emit('submit', courseData);
};

// Handle form cancellation
const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="course-form">
    <v-form @submit.prevent="handleSubmit">
      <v-row>
        <!-- Title field -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="title"
            label="Course Title"
            :error-messages="errors.title"
            variant="outlined"
            required
          ></v-text-field>
        </v-col>
        
        <!-- Date field -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="date"
            label="Course Date"
            type="date"
            :error-messages="errors.date"
            variant="outlined"
            required
          ></v-text-field>
        </v-col>
        
        <!-- Description field -->
        <v-col cols="12">
          <v-textarea
            v-model="description"
            label="Course Description"
            :error-messages="errors.description"
            variant="outlined"
            auto-grow
            rows="3"
            required
          ></v-textarea>
        </v-col>
        
        <!-- Total marks field -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="totalMarks"
            label="Total Marks"
            type="number"
            :error-messages="errors.totalMarks"
            variant="outlined"
            min="1"
            max="1000"
            required
          ></v-text-field>
        </v-col>
        
        <!-- Difficulty rating field -->
        <v-col cols="12" md="6">
          <v-select
            v-model="difficultyRating"
            label="Difficulty"
            :items="difficultyOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            required
          ></v-select>
        </v-col>
      </v-row>
      
      <!-- Form actions -->
      <v-row>
        <v-col cols="12" class="d-flex justify-end">
          <v-btn 
            variant="text" 
            class="me-2"
            @click="handleCancel"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            type="submit"
          >
            {{ isEditMode ? 'Update Course' : 'Create Course' }}
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<style scoped>
.course-form {
  width: 100%;
}
</style>