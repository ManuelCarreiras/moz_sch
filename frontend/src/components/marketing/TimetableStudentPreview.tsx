/**
 * Stylized student weekly schedule — sample data only.
 */
export function TimetableStudentPreview() {
  return (
    <div className="uiPreview" aria-label="Simplified preview of student timetable">
      <div className="uiPreview__chrome">
        <span className="uiPreview__dot" />
        <span className="uiPreview__dot" />
        <span className="uiPreview__dot" />
        <span className="uiPreview__title">Student portal — Schedule</span>
      </div>
      <div className="uiPreview__body">
        <div className="uiPreview__filters">
          <span className="uiPreview__filter">Year: 2026</span>
          <span className="uiPreview__filter">Term: T2</span>
        </div>
        <p className="uiPreview__gridIntro">
          Students open their <strong>class schedule online</strong> for the selected term: subject, teacher, time slot, and room in one place.
        </p>
        <table className="uiPreview__table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Monday</th>
              <th>Tuesday</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Portuguese — Prof. Lopes — R201</td>
              <td>Mathematics — Dr. Almeida — R105</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Mathematics — Dr. Almeida — R105</td>
              <td>Science — Prof. Mendes — Lab A</td>
            </tr>
            <tr>
              <td>3</td>
              <td>English — Prof. Costa — R208</td>
              <td>History — Prof. Silva — R310</td>
            </tr>
          </tbody>
        </table>
        <p className="uiPreview__hint">
          Same <strong>school scheduling</strong> data powers <strong>attendance</strong> and <strong>gradebook</strong> filters so the week you see matches the class you are in.
        </p>
      </div>
    </div>
  )
}
