/**
 * Stylized student grades overview — sample data only.
 */
export function GradebookStudentViewPreview() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg"
      aria-label="Simplified preview of student grade view"
    >
      <div className="flex items-center gap-2 border-b border-border/30 bg-surface px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning" />
        <span className="h-2.5 w-2.5 rounded-full bg-success" />
        <span className="ml-2 text-xs font-medium text-muted">Student portal — Grades</span>
      </div>
      <div className="p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Year: 2026</span>
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Term: T2</span>
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Subject: Mathematics</span>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-muted">
          Students see <strong>assignment marks</strong> and <strong>term or year averages</strong> with the same year,
          term, subject, and class filters teachers use—so everyone reads the same numbers.
        </p>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/30">
            <tr>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Item</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Mark</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Weight</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">Homework — week 3</td>
              <td className="py-2.5 pr-4 text-sm text-text">18 / 20</td>
              <td className="py-2.5 pr-4 text-sm text-text">10%</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">Test — Chapter 4</td>
              <td className="py-2.5 pr-4 text-sm text-text">16 / 20</td>
              <td className="py-2.5 pr-4 text-sm text-text">40%</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">
                <strong>Term average</strong>
              </td>
              <td className="py-2.5 pr-4 text-sm text-text">
                <strong>16.4</strong>
              </td>
              <td className="py-2.5 pr-4 text-sm text-text">—</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs leading-relaxed text-muted/80">
          Exact scales (for example 0–20) and weighting rules follow your <strong>school’s academic setup</strong>.
        </p>
      </div>
    </div>
  )
}
