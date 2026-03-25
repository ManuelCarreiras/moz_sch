/**
 * Stylized teacher weekly schedule — sample data only.
 */
export function TimetableTeacherPreview() {
  return (
    <div className="uiPreview" aria-label="Simplified preview of teacher timetable">
      <div className="uiPreview__chrome">
        <span className="uiPreview__dot" />
        <span className="uiPreview__dot" />
        <span className="uiPreview__dot" />
        <span className="uiPreview__title">Teacher portal — Schedule</span>
      </div>
      <div className="uiPreview__body">
        <div className="uiPreview__filters">
          <span className="uiPreview__filter">Year: 2026</span>
          <span className="uiPreview__filter">Term: T2</span>
        </div>
        <p className="uiPreview__gridIntro">
          See <strong>which class</strong> you teach in <strong>which period</strong>, with <strong>room</strong> and <strong>subject</strong> on one weekly grid.
        </p>
        <table className="uiPreview__table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Math 10A — R101</td>
              <td>—</td>
              <td>Math 10B — R102</td>
            </tr>
            <tr>
              <td>2</td>
              <td>—</td>
              <td>Math 10A — R101</td>
              <td>—</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Math 9C — Lab</td>
              <td>Math 9C — Lab</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
        <p className="uiPreview__hint">
          Real screens follow your <strong>school year</strong>, <strong>terms</strong>, and <strong>periods</strong> from academic setup.
        </p>
      </div>
    </div>
  )
}
