/**
 * Stylized teacher grade entry screen — sample data only.
 */
export function GradebookModulePreview() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg"
      aria-label="Simplified preview of teacher gradebook entry"
    >
      <div className="flex items-center gap-2 border-b border-border/30 bg-surface px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning" />
        <span className="h-2.5 w-2.5 rounded-full bg-success" />
        <span className="ml-2 text-xs font-medium text-muted">Teacher portal — Grades (gradebook)</span>
      </div>
      <div className="p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Year: 2026</span>
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Term: T2</span>
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Subject: Mathematics</span>
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Class: 10A</span>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-muted">
          Pick an <strong>assignment</strong>, then enter or update each student’s mark. The platform applies your{' '}
          <strong>grading criteria</strong> and <strong>weights</strong> for term and year averages.
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">
            Assignment: Test — Chapter 4
          </span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/30">
            <tr>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Student</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Grade</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Out of</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">Silva, Maria</td>
              <td className="py-2.5 pr-4 text-sm text-text">16</td>
              <td className="py-2.5 pr-4 text-sm text-text">20</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">João, Pedro</td>
              <td className="py-2.5 pr-4 text-sm text-text">14</td>
              <td className="py-2.5 pr-4 text-sm text-text">20</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">Costa, Ana</td>
              <td className="py-2.5 pr-4 text-sm text-text">—</td>
              <td className="py-2.5 pr-4 text-sm text-text">20</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs leading-relaxed text-muted/80">
          In the real app, <strong>assessment types</strong> (tests, homework, projects) and <strong>weights</strong> feed
          into weighted averages and <strong>year grades</strong> automatically once your school sets the rules.
        </p>
      </div>
    </div>
  )
}
