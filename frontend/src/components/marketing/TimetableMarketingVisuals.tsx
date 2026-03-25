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
    <div className="marketingVisuals">
      <figure className="marketingVisuals__figure">
        <div className="marketingVisuals__frame">
          {teacher === 'ok' ? (
            <img
              className="marketingScreenshot"
              src={TEACHER_SHOT}
              alt="Teacher school timetable showing weekly periods, subjects, classes, and rooms"
            />
          ) : (
            <TimetableTeacherPreview />
          )}
        </div>
        <figcaption className="marketingVisuals__caption">
          Teacher timetable: weekly view with periods, classes, subjects, and rooms for the selected term.
        </figcaption>
      </figure>

      <figure className="marketingVisuals__figure">
        <div className="marketingVisuals__frame">
          {student === 'ok' ? (
            <img
              className="marketingScreenshot"
              src={STUDENT_SHOT}
              alt="Student class schedule online for the school week with subjects and teachers"
            />
          ) : (
            <TimetableStudentPreview />
          )}
        </div>
        <figcaption className="marketingVisuals__caption">
          Student schedule online: same structure, filtered to the logged-in student’s classes.
        </figcaption>
      </figure>
    </div>
  )
}
