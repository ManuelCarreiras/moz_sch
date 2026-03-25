/**
 * Stylized teacher grade entry screen — sample data only.
 */
export function GradebookModulePreview() {
  return (
    <div className="uiPreview" aria-label="Simplified preview of teacher gradebook entry">
      <div className="uiPreview__chrome">
        <span className="uiPreview__dot" />
        <span className="uiPreview__dot" />
        <span className="uiPreview__dot" />
        <span className="uiPreview__title">Teacher portal — Grades (gradebook)</span>
      </div>
      <div className="uiPreview__body">
        <div className="uiPreview__filters">
          <span className="uiPreview__filter">Year: 2026</span>
          <span className="uiPreview__filter">Term: T2</span>
          <span className="uiPreview__filter">Subject: Mathematics</span>
          <span className="uiPreview__filter">Class: 10A</span>
        </div>
        <p className="uiPreview__gridIntro">
          Pick an <strong>assignment</strong>, then enter or update each student’s mark. The platform applies your <strong>grading criteria</strong> and <strong>weights</strong> for term and year averages.
        </p>
        <div className="uiPreview__toolbar">
          <span className="uiPreview__filter">Assignment: Test — Chapter 4</span>
        </div>
        <table className="uiPreview__table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Grade</th>
              <th>Out of</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Silva, Maria</td>
              <td>16</td>
              <td>20</td>
            </tr>
            <tr>
              <td>João, Pedro</td>
              <td>14</td>
              <td>20</td>
            </tr>
            <tr>
              <td>Costa, Ana</td>
              <td>—</td>
              <td>20</td>
            </tr>
          </tbody>
        </table>
        <p className="uiPreview__hint">
          In the real app, <strong>assessment types</strong> (tests, homework, projects) and <strong>weights</strong> feed into weighted averages and <strong>year grades</strong> automatically once your school sets the rules.
        </p>
      </div>
    </div>
  )
}
