export const TIMETABLE_CANONICAL = '/features/school-timetable'

/** /features/{slug} → canonical school timetable marketing page */
export const TIMETABLE_FEATURE_ALIASES: string[] = [
  'school-timetable-software',
  'class-scheduling-software',
  'school-scheduling',
  'school-scheduling-software',
  'timetable-planner',
  'timetable-planner-school',
  'student-timetable',
  'student-schedule',
  'student-schedule-online',
  'teacher-timetable',
  'teacher-schedule',
  'teacher-schedule-online',
  'class-timetable',
  'weekly-timetable',
  'period-timetable',
  'school-calendar-schedule',
]

/** Short root paths (keep small; avoid clashes with gradebook/financial roots) */
export const TIMETABLE_ROOT_ALIASES: string[] = [
  'school-timetable',
  'class-schedule',
]
