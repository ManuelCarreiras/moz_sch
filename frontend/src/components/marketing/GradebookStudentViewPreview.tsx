/**
 * Stylized student grades overview — sample data only.
 */
export function GradebookStudentViewPreview() {
  return (
    <div className="uiPreview" aria-label="Simplified preview of student grade view">
      <div className="uiPreview__chrome">
        <span className="uiPreview__dot" />
        <span className="uiPreview__dot" />
        <span className="uiPreview__dot" />
        <span className="uiPreview__title">Student portal — Grades</span>
      </div>
      <div className="uiPreview__body">
        <div className="uiPreview__filters">
          <span className="uiPreview__filter">Year: 2026</span>
          <span className="uiPreview__filter">Term: T2</span>
          <span className="uiPreview__filter">Subject: Mathematics</span>
        </div>
        <p className="uiPreview__gridIntro">
          Students see <strong>assignment marks</strong> and <strong>term or year averages</strong> with the same year, term, subject, and class filters teachers use—so everyone reads the same numbers.
        </p>
        <table className="uiPreview__table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Mark</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Homework — week 3</td>
              <td>18 / 20</td>
              <td>10%</td>
            </tr>
            <tr>
              <td>Test — Chapter 4</td>
              <td>16 / 20</td>
              <td>40%</td>
            </tr>
            <tr>
              <td><strong>Term average</strong></td>
              <td><strong>16.4</strong></td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
        <p className="uiPreview__hint">
          Exact scales (for example 0–20) and weighting rules follow your <strong>school’s academic setup</strong>.
        </p>
      </div>
    </div>
  )
}
