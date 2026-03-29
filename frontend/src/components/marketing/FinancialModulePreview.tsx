/**
 * Stylized preview of the financial UI — not live data; helps prospects picture the real product.
 */
export function FinancialModulePreview() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg"
      aria-label="Simplified preview of the fee management screen"
    >
      <div className="flex items-center gap-2 border-b border-border/30 bg-surface px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning" />
        <span className="h-2.5 w-2.5 rounded-full bg-success" />
        <span className="ml-2 text-xs font-medium text-muted">Financial management — Mensality</span>
      </div>
      <div className="p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Month: March</span>
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Year: 2026</span>
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Status: Unpaid</span>
          <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted">Student: All</span>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary">
            Generate monthly fees
          </span>
          <span className="rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted">
            Add record
          </span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/30">
            <tr>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Student</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Amount</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Due date</th>
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">Silva, Maria</td>
              <td className="py-2.5 pr-4 text-sm text-text">15,000</td>
              <td className="py-2.5 pr-4 text-sm text-text">2026-03-10</td>
              <td className="py-2.5 pr-4 text-sm text-text">
                <span className="inline-block rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-semibold text-danger">
                  Unpaid
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">João, Pedro</td>
              <td className="py-2.5 pr-4 text-sm text-text">15,000</td>
              <td className="py-2.5 pr-4 text-sm text-text">2026-03-10</td>
              <td className="py-2.5 pr-4 text-sm text-text">
                <span className="inline-block rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                  Paid
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-sm text-text">Costa, Ana</td>
              <td className="py-2.5 pr-4 text-sm text-text">15,000</td>
              <td className="py-2.5 pr-4 text-sm text-text">2026-03-10</td>
              <td className="py-2.5 pr-4 text-sm text-text">
                <span className="inline-block rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-semibold text-danger">
                  Unpaid
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs leading-relaxed text-muted/80">
          In the real app, your team filters by month and paid/unpaid, generates monthly lines in one step, then marks each row paid when the fee arrives—same idea for teacher and staff salaries.
        </p>
      </div>
    </div>
  )
}
