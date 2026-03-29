import { useMarketingImage } from './useMarketingImage'
import { GradebookModulePreview } from './GradebookModulePreview'
import { GradebookStudentViewPreview } from './GradebookStudentViewPreview'

const TEACHER_SHOT = '/marketing/gradebook-teacher-entry.png'
const STUDENT_SHOT = '/marketing/gradebook-student-grades.png'

/**
 * Add PNGs under frontend/public/marketing/ to replace previews.
 */
export function GradebookMarketingVisuals() {
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
              alt="Teacher gradebook: filters for year, term, subject, class, and a list of students with grades for one assignment"
            />
          ) : (
            <GradebookModulePreview />
          )}
        </div>
        <figcaption className="mt-3 text-center text-sm text-muted">
          Teacher online gradebook: pick class and assignment, enter marks, apply weights and rules your school configured.
        </figcaption>
      </figure>

      <figure>
        <div>
          {student === 'ok' ? (
            <img
              className="w-full rounded-2xl border border-border/50 shadow-lg"
              src={STUDENT_SHOT}
              alt="Student view of grades showing assignment marks and term average for one subject"
            />
          ) : (
            <GradebookStudentViewPreview />
          )}
        </div>
        <figcaption className="mt-3 text-center text-sm text-muted">
          Student view: assignment results and averages so families see the same picture the school uses.
        </figcaption>
      </figure>
    </div>
  )
}
