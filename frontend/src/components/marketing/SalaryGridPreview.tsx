/**
 * Stylized preview of teacher/staff salary grid — sample data only.
 */
export function SalaryGridPreview() {
  return (
    <div className="uiPreview" aria-label="Simplified preview of the salary grid screen">
      <div className="uiPreview__chrome">
        <span className="uiPreview__dot" />
        <span className="uiPreview__dot" />
        <span className="uiPreview__dot" />
        <span className="uiPreview__title">Financial management — Teacher salary grid</span>
      </div>
      <div className="uiPreview__body">
        <p className="uiPreview__gridIntro">Set each teacher’s base salary, then generate monthly payroll lines from this grid.</p>
        <table className="uiPreview__table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Base salary</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dr. Almeida</td>
              <td>45,000</td>
              <td>2026-01-15</td>
            </tr>
            <tr>
              <td>Prof. Mendes</td>
              <td>38,000</td>
              <td>2026-01-15</td>
            </tr>
            <tr>
              <td>Prof. Lopes</td>
              <td>38,000</td>
              <td>2026-02-01</td>
            </tr>
          </tbody>
        </table>
        <p className="uiPreview__hint">
          From here, finance runs monthly generation so each month gets its own salary row with due date and paid/unpaid status—same pattern for staff salaries.
        </p>
      </div>
    </div>
  )
}
