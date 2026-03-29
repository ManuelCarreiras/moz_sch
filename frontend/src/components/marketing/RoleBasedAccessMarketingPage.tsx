import { Link, useNavigate } from 'react-router-dom'
import { MarketingLayout } from './MarketingLayout'
import { Seo } from './Seo'

export function RoleBasedAccessMarketingPage() {
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      <Seo
        title="Role-based access for schools | Santa Isabel Escola"
        description="Secure login with separate portals for administrators, secretaries, finance, teachers, and students."
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-text sm:text-5xl">Role-based access</h1>
            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              Each role sees what they need: admins and secretaries run the school, finance handles fees and salaries, teachers manage classes, students view their own data.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                className="w-full cursor-pointer rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-xl sm:w-auto"
                type="button"
                onClick={() => navigate('/contact')}
              >
                Request a demo
              </button>
              <Link className="w-full rounded-xl border border-border px-8 py-3.5 text-center text-base font-semibold text-text transition-all hover:border-primary/50 hover:bg-surface sm:w-auto no-underline" to="/school-management-system">
                School management overview
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Portals by role</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Administrator</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Full access including staff management and financial tools.</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Secretary</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Students, teachers, guardians, academic setup, and classes.</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Financial</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Student fees, teacher salaries, and staff salaries.</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Teacher</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Assignments, gradebook, attendance, schedules, and resources.</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Student</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Grades, assignments, attendance, schedule, and resources.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Security model</h2>
          <ul className="mt-6 space-y-3 list-none p-0 m-0">
            <li className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong className="text-text">Authentication</strong> via AWS Cognito with email login.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong className="text-text">Authorization</strong> enforced on the API so sensitive actions stay server-side.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong className="text-text">Separation</strong> so finance data and academic admin tools are not exposed to student accounts.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">What this is not</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            This is role-based access control for your school platform—not a general-purpose IAM system or directory service. It is built for the specific roles and workflows schools need.
          </p>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Frequently asked questions</h2>
          <div className="mt-8 space-y-3">
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Can I customize which tabs each role sees?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-muted">
                The platform ships with sensible defaults per role. Custom per-school overrides are on the roadmap—contact us to discuss your needs.
              </p>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Is student data visible to other students?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-muted">
                No. Students see only their own grades, attendance, and schedule. Teacher and admin data is never exposed to student accounts.
              </p>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                What authentication provider do you use?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-muted">
                AWS Cognito handles authentication with email-based login. Authorization is enforced server-side on every API call.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-700 px-6 py-14 text-center shadow-2xl shadow-primary/20 sm:px-12 sm:py-20">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">See portals for every role</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
              Book a short walkthrough of administrator, teacher, and student views—and how permissions stay enforced end to end.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                className="w-full cursor-pointer rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg transition-all hover:bg-slate-50 sm:w-auto"
                type="button"
                onClick={() => navigate('/contact')}
              >
                Request a demo
              </button>
              <Link className="w-full rounded-xl border border-white/30 px-8 py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-white/10 sm:w-auto no-underline" to="/school-management-system">
                School management overview
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-text sm:text-3xl">Related</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline" to="/school-management-system">
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">School management system</h3>
              <p className="mt-2 text-sm text-muted">How role-based portals fit into daily school operations.</p>
            </Link>
            <Link className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline" to="/features/gradebook">
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">Gradebook</h3>
              <p className="mt-2 text-sm text-muted">Teacher grading workflows behind role-appropriate access.</p>
            </Link>
            <Link className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline" to="/features/financial-management">
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">Financial management</h3>
              <p className="mt-2 text-sm text-muted">Fees and payroll with finance-role visibility.</p>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
