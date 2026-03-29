/**
 * Stylized student weekly schedule — sample data only.
 */
export function TimetableStudentPreview() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg"
      aria-label="Simplified preview of student timetable"
    >
      <div className="flex items-center gap-2 border-b border-border/30 bg-surface px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning" />
        <span className="h-2.5 w-2.5 rounded-full bg-success" />
        <span className="ml-2 text-xs font-medium text-muted">Student portal — Schedule</span>
      </div>
      <div className="p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Year: 2026</span>
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Term: T2</span>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-muted">
          Students open their <strong>class schedule online</strong> for the selected term: subject, teacher, time slot,
          and room in one place.
        </p>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/30">
            <tr>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Period</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Monday</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Tuesday</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">1</td>
              <td className="py-2.5 pr-4 text-sm text-text">Portuguese — Prof. Lopes — R201</td>
              <td className="py-2.5 pr-4 text-sm text-text">Mathematics — Dr. Almeida — R105</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">2</td>
              <td className="py-2.5 pr-4 text-sm text-text">Mathematics — Dr. Almeida — R105</td>
              <td className="py-2.5 pr-4 text-sm text-text">Science — Prof. Mendes — Lab A</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">3</td>
              <td className="py-2.5 pr-4 text-sm text-text">English — Prof. Costa — R208</td>
              <td className="py-2.5 pr-4 text-sm text-text">History — Prof. Silva — R310</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs leading-relaxed text-muted/80">
          Same <strong>school scheduling</strong> data powers <strong>attendance</strong> and <strong>gradebook</strong>{' '}
          filters so the week you see matches the class you are in.
        </p>
      </div>
    </div>
  )
}
