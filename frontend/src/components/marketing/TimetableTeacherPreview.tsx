/**
 * Stylized teacher weekly schedule — sample data only.
 */
export function TimetableTeacherPreview() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg"
      aria-label="Simplified preview of teacher timetable"
    >
      <div className="flex items-center gap-2 border-b border-border/30 bg-surface px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning" />
        <span className="h-2.5 w-2.5 rounded-full bg-success" />
        <span className="ml-2 text-xs font-medium text-muted">Teacher portal — Schedule</span>
      </div>
      <div className="p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Year: 2026</span>
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Term: T2</span>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-muted">
          See <strong>which class</strong> you teach in <strong>which period</strong>, with <strong>room</strong> and{' '}
          <strong>subject</strong> on one weekly grid.
        </p>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/30">
            <tr>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Period</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Mon</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Tue</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Wed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">1</td>
              <td className="py-2.5 pr-4 text-sm text-text">Math 10A — R101</td>
              <td className="py-2.5 pr-4 text-sm text-text">—</td>
              <td className="py-2.5 pr-4 text-sm text-text">Math 10B — R102</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">2</td>
              <td className="py-2.5 pr-4 text-sm text-text">—</td>
              <td className="py-2.5 pr-4 text-sm text-text">Math 10A — R101</td>
              <td className="py-2.5 pr-4 text-sm text-text">—</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">3</td>
              <td className="py-2.5 pr-4 text-sm text-text">Math 9C — Lab</td>
              <td className="py-2.5 pr-4 text-sm text-text">Math 9C — Lab</td>
              <td className="py-2.5 pr-4 text-sm text-text">—</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs leading-relaxed text-muted/80">
          Real screens follow your <strong>school year</strong>, <strong>terms</strong>, and <strong>periods</strong> from
          academic setup.
        </p>
      </div>
    </div>
  )
}
