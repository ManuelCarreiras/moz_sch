import { Link, useNavigate } from 'react-router-dom'
import { MarketingLayout } from './MarketingLayout'
import { Seo } from './Seo'
import { FinancialMarketingVisuals } from './FinancialMarketingVisuals'
import { FINANCIAL_MANAGEMENT_CANONICAL } from './financialManagementSeoRoutes'

export function FinancialMarketingPage() {
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      <Seo
        title="School tuition & fee management software | School platform | Santa Isabel Escola"
        description="Tuition management, school fees, and billing in one school platform: monthly fee lines, paid/unpaid tracking, teacher and staff salary grids, and generation workflows for your finance office."
        canonicalPath={FINANCIAL_MANAGEMENT_CANONICAL}
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
              Tuition, school fees & salary management in one platform
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              Run <strong>tuition and school fee billing</strong> next to <strong>teacher and staff salaries</strong>—same school platform as classes and enrollment. Filter by month, generate monthly charges, and mark fees and payroll as paid when money is received.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-xl sm:w-auto"
                onClick={() => navigate('/contact')}
              >
                Request a demo
              </button>
              <Link
                to="/features"
                className="w-full rounded-xl border border-border px-8 py-3.5 text-center text-base font-semibold text-text transition-all hover:border-primary/50 hover:bg-surface sm:w-auto no-underline"
              >
                All features
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Tuition, fees & billing without a separate tool</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            Whether your team calls it <strong>tuition management</strong>, <strong>school fees</strong>, or <strong>billing</strong>, the work is the same: monthly mensality or fee lines, who paid, and what is still open. This module keeps that work inside your <strong>school management platform</strong>, so student names and classes stay aligned with what families owe and what you have marked as paid.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            <strong>Teacher salary management</strong> and <strong>staff payroll records</strong> follow the same pattern: base amounts in a grid, monthly lines, due dates, and paid/unpaid status—so finance does not maintain a parallel spreadsheet for payroll alone.
          </p>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">What it looks like in the app</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            Your finance team works from screens like these: filters at the top, then fee or salary rows you can mark as paid. The examples below show the layout with sample data so visitors can picture the workflow—on a live demo you see your school’s real setup.
          </p>
          <FinancialMarketingVisuals />
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Who it is for</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">School finance teams</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">See what is due, what is paid, and what is still open for the month—without juggling spreadsheets for every class.</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Heads of school & admins</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Keep fee collection and payroll workflows aligned with the same student and staff records the rest of the school uses.</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Secretaries (where applicable)</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">When your process mixes academic and fee follow-up, everyone works from shared, up-to-date records.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">What it covers</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Student fees & tuition</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Monthly fee records (including <strong>mensality</strong>-style monthly billing) with filters by month, year, student, and paid/unpaid status.
                Generate charges for many students at once for a given period, then mark payments as you receive them.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Teacher salaries</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Maintain a <strong>salary grid</strong> of base amounts, generate monthly salary records, set due dates, and track paid vs unpaid the same way you track fees.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Staff salaries</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                For administrative staff (e.g. finance and secretary roles), use a dedicated staff salary grid and monthly records so payroll is consistent across the team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Typical monthly workflow</h2>
          <ol className="mt-6 list-none space-y-4 p-0 m-0">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">1</span>
              <p className="text-base leading-relaxed text-muted">
                <strong className="text-text">Open the right month</strong> using year and month filters so you only see current work.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">2</span>
              <p className="text-base leading-relaxed text-muted">
                <strong className="text-text">Generate or create</strong> student fee lines and salary lines from grids where your school uses bulk generation.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">3</span>
              <p className="text-base leading-relaxed text-muted">
                <strong className="text-text">Review unpaid</strong> using paid/unpaid filters to chase fees or confirm payroll.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">4</span>
              <p className="text-base leading-relaxed text-muted">
                <strong className="text-text">Mark as paid</strong> when money moves, and record the payment date for your school’s records if you need it.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Key capabilities</h2>
          <ul className="mt-6 list-none space-y-3 p-0 m-0">
            <li className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong className="text-text">Tuition and fee records</strong> per student and month, with bulk generation when your school bills everyone the same way.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong className="text-text">Monthly generation</strong> from base salary grids for teachers and staff.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong className="text-text">Paid/unpaid tracking</strong> with filters so finance can work from a short list every week.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong className="text-text">Role-based access</strong> so only authorized users open financial tabs—see <Link to="/features/role-based-access">role-based access</Link>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong className="text-text">Same school platform as academics</strong> so enrollment and billing stay in sync (not a disconnected billing-only tool).
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">What this is not</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            This module is built for <strong>school fee and salary operations inside your school management platform</strong>.
            It is not a full replacement for a national-chart-of-accounts accounting suite, tax filing software, or a bank’s payment gateway—though you can describe how your school maps exports or manual journal entries if needed.
          </p>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Frequently asked questions</h2>
          <div className="mt-8 space-y-3">
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Is this tuition management software for schools?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                Yes, in the sense schools usually mean: <strong>track monthly tuition or school fees</strong>, see who has paid, and generate the month’s charges in one place. It is built for the <strong>school office workflow</strong> (recording and status), not for parent self-checkout unless you add a payment integration later.
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Does it work as school billing or fee collection software?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                It gives you a <strong>clear fee ledger</strong>: amounts, due dates, month and year, and paid or unpaid. That is what most schools mean by <strong>billing</strong> or <strong>fee collection tracking</strong> day to day. Card or bank payments from parents are separate from recording what was received.
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Can parents pay online through this page?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                Today the system is built to help your office <strong>record who owes what, generate monthly fee lines, and mark fees as paid</strong> when money arrives.
                If you want parents to pay by card online, that usually means connecting a payment provider; we can discuss that when you are ready.
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                What is “mensality”?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                It usually means the <strong>monthly school fee or tuition</strong> (one payment per month). We also say “fees” and “tuition” here so the same idea is clear for every school.
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Can teachers see fee balances?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                Access is <strong>role-based</strong>. Financial users and admins handle fee and salary screens; teachers use the teacher portal for class work unless you explicitly give them broader access.
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Does it replace payroll with the government or a bank?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                No. It helps the school <strong>organize amounts, months, and paid status</strong>. Actual bank transfers and statutory payroll filings stay in your bank and accounting processes unless you integrate them separately.
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-700 px-6 py-14 text-center shadow-2xl shadow-primary/20 sm:px-12 sm:py-20">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">See it with your workflows</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
              If you tell us how you bill (per month, per term, discounts, scholarships), we can map it to these screens in a short demo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg transition-all hover:bg-slate-50 sm:w-auto"
                onClick={() => navigate('/contact')}
              >
                Request a demo
              </button>
              <Link
                to="/school-management-system"
                className="w-full rounded-xl border border-white/30 px-8 py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-white/10 sm:w-auto no-underline"
              >
                Platform overview
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-text sm:text-3xl">Related</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/features/role-based-access"
              className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline"
            >
              <h3 className="text-lg font-semibold text-text transition-colors group-hover:text-primary">Role-based access</h3>
              <p className="mt-2 text-sm text-muted">Who can open financial management and who cannot.</p>
            </Link>
            <Link
              to="/school-management-system"
              className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline"
            >
              <h3 className="text-lg font-semibold text-text transition-colors group-hover:text-primary">School management system</h3>
              <p className="mt-2 text-sm text-muted">How finance connects to gradebook, attendance, and timetables.</p>
            </Link>
            <Link
              to="/features/gradebook"
              className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline"
            >
              <h3 className="text-lg font-semibold text-text transition-colors group-hover:text-primary">Gradebook</h3>
              <p className="mt-2 text-sm text-muted">Academic operations that sit alongside finance in one platform.</p>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
