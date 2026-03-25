export const GRADEBOOK_CANONICAL = '/features/gradebook'

/**
 * /features/{slug} → redirect to canonical gradebook money page.
 */
export const GRADEBOOK_FEATURE_ALIASES: string[] = [
  'online-gradebook',
  'online-gradebook-for-teachers',
  'teacher-gradebook',
  'teacher-gradebook-app',
  'grading-software',
  'grading-software-for-schools',
  'grading-software-for-teachers',
  'school-gradebook',
  'school-gradebook-system',
  'school-gradebook-software',
  'weighted-gradebook',
  'weighted-grades',
  'weighted-grade-calculator',
  'digital-gradebook',
  'electronic-gradebook',
  'student-gradebook',
  'gradebook-multiple-classes',
]

/** Short root paths → canonical (keep list small). */
export const GRADEBOOK_ROOT_ALIASES: string[] = [
  'online-gradebook',
  'teacher-gradebook',
  'school-gradebook',
]
