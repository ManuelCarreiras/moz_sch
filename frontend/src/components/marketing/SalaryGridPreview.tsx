/**
 * Stylized preview of teacher/staff salary grid — sample data only.
 */
export function SalaryGridPreview() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg"
      aria-label="Simplified preview of the salary grid screen"
    >
      <div className="flex items-center gap-2 border-b border-border/30 bg-surface px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning" />
        <span className="h-2.5 w-2.5 rounded-full bg-success" />
        <span className="ml-2 text-xs font-medium text-muted">Financial management — Teacher salary grid</span>
      </div>
      <div className="p-5">
        <p className="mb-4 text-sm leading-relaxed text-muted">
          Set each teacher’s base salary, then generate monthly payroll lines from this grid.
        </p>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/30">
            <tr>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Teacher</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Base salary</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Last updated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">Dr. Almeida</td>
              <td className="py-2.5 pr-4 text-sm text-text">45,000</td>
              <td className="py-2.5 pr-4 text-sm text-text">2026-01-15</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">Prof. Mendes</td>
              <td className="py-2.5 pr-4 text-sm text-text">38,000</td>
              <td className="py-2.5 pr-4 text-sm text-text">2026-01-15</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">Prof. Lopes</td>
              <td className="py-2.5 pr-4 text-sm text-text">38,000</td>
              <td className="py-2.5 pr-4 text-sm text-text">2026-02-01</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs leading-relaxed text-muted/80">
          From here, finance runs monthly generation so each month gets its own salary row with due date and paid/unpaid status—same pattern for staff salaries.
        </p>
      </div>
    </div>
  )
}
