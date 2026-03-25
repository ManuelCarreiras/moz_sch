/**
 * Stylized preview of the financial UI — not live data; helps prospects picture the real product.
 */
export function FinancialModulePreview() {
  return (
    <div className="uiPreview" aria-label="Simplified preview of the fee management screen">
      <div className="uiPreview__chrome">
        <span className="uiPreview__dot" />
        <span className="uiPreview__dot" />
        <span className="uiPreview__dot" />
        <span className="uiPreview__title">Financial management — Mensality</span>
      </div>
      <div className="uiPreview__body">
        <div className="uiPreview__filters">
          <span className="uiPreview__filter">Month: March</span>
          <span className="uiPreview__filter">Year: 2026</span>
          <span className="uiPreview__filter">Status: Unpaid</span>
          <span className="uiPreview__filter">Student: All</span>
        </div>
        <div className="uiPreview__toolbar">
          <span className="uiPreview__btn uiPreview__btn--primary">Generate monthly fees</span>
          <span className="uiPreview__btn">Add record</span>
        </div>
        <table className="uiPreview__table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Amount</th>
              <th>Due date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Silva, Maria</td>
              <td>15,000</td>
              <td>2026-03-10</td>
              <td><span className="uiPreview__badge uiPreview__badge--unpaid">Unpaid</span></td>
            </tr>
            <tr>
              <td>João, Pedro</td>
              <td>15,000</td>
              <td>2026-03-10</td>
              <td><span className="uiPreview__badge uiPreview__badge--paid">Paid</span></td>
            </tr>
            <tr>
              <td>Costa, Ana</td>
              <td>15,000</td>
              <td>2026-03-10</td>
              <td><span className="uiPreview__badge uiPreview__badge--unpaid">Unpaid</span></td>
            </tr>
          </tbody>
        </table>
        <p className="uiPreview__hint">
          In the real app, your team filters by month and paid/unpaid, generates monthly lines in one step, then marks each row paid when the fee arrives—same idea for teacher and staff salaries.
        </p>
      </div>
    </div>
  )
}
