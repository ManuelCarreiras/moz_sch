import { useMarketingImage } from './useMarketingImage'
import { TimetableTeacherPreview } from './TimetableTeacherPreview'
import { TimetableStudentPreview } from './TimetableStudentPreview'

const TEACHER_SHOT = '/marketing/timetable-teacher-schedule.png'
const STUDENT_SHOT = '/marketing/timetable-student-schedule.png'

/** Add PNGs under frontend/public/marketing/ to replace previews. */
export function TimetableMarketingVisuals() {
  const teacher = useMarketingImage(TEACHER_SHOT)
  const student = useMarketingImage(STUDENT_SHOT)

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <figure>
        <div>
          {teacher === 'ok' ? (
            <img
              className="w-full rounded-2xl border border-border/50 shadow-lg"
              src={TEACHER_SHOT}
              alt="Teacher school timetable showing weekly periods, subjects, classes, and rooms"
            />
          ) : (
            <TimetableTeacherPreview />
          )}
        </div>
        <figcaption className="mt-3 text-center text-sm text-muted">
          Teacher timetable: weekly view with periods, classes, subjects, and rooms for the selected term.
        </figcaption>
      </figure>

      <figure>
        <div>
          {student === 'ok' ? (
            <img
              className="w-full rounded-2xl border border-border/50 shadow-lg"
              src={STUDENT_SHOT}
              alt="Student class schedule online for the school week with subjects and teachers"
            />
          ) : (
            <TimetableStudentPreview />
          )}
        </div>
        <figcaption className="mt-3 text-center text-sm text-muted">
          Student schedule online: same structure, filtered to the logged-in student’s classes.
        </figcaption>
      </figure>
    </div>
  )
}
