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
    <div className="marketingVisuals">
      <figure className="marketingVisuals__figure">
        <div className="marketingVisuals__frame">
          {teacher === 'ok' ? (
            <img
              className="marketingScreenshot"
              src={TEACHER_SHOT}
              alt="Teacher gradebook: filters for year, term, subject, class, and a list of students with grades for one assignment"
            />
          ) : (
            <GradebookModulePreview />
          )}
        </div>
        <figcaption className="marketingVisuals__caption">
          Teacher online gradebook: pick class and assignment, enter marks, apply weights and rules your school configured.
        </figcaption>
      </figure>

      <figure className="marketingVisuals__figure">
        <div className="marketingVisuals__frame">
          {student === 'ok' ? (
            <img
              className="marketingScreenshot"
              src={STUDENT_SHOT}
              alt="Student view of grades showing assignment marks and term average for one subject"
            />
          ) : (
            <GradebookStudentViewPreview />
          )}
        </div>
        <figcaption className="marketingVisuals__caption">
          Student view: assignment results and averages so families see the same picture the school uses.
        </figcaption>
      </figure>
    </div>
  )
}
