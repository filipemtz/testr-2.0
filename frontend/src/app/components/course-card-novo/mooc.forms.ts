export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export const COURSE_FIELDS: FormField[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'program', label: 'Undergraduate course', type: 'select', options: [
      { value: '', label: '— none —' },
      { value: 'Computer Science', label: 'Computer Science' },
      { value: 'Statistics', label: 'Statistics' } ] },
  { key: 'semester', label: 'Semester', type: 'text', placeholder: 'e.g., 2026/2' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

export const SECTION_FIELDS: FormField[] = [
  { key: 'title', label: 'Section title', type: 'text', required: true },
];

export const ACTIVITY_FIELDS: FormField[] = [
  { key: 'title', label: 'Activity title', type: 'text', required: true },
  { key: 'type', label: 'Type', type: 'select', options: [
      { value: 'video', label: 'Video' }, { value: 'reading', label: 'Reading' },
      { value: 'quiz', label: 'Quiz' }, { value: 'assignment', label: 'Assignment' } ] },
  { key: 'minutes', label: 'Duration (min)', type: 'number', required: true },
];
