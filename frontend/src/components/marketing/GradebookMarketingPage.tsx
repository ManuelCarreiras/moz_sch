import { Link, useNavigate } from 'react-router-dom'
import { MarketingLayout } from './MarketingLayout'
import { Seo } from './Seo'
import { GradebookMarketingVisuals } from './GradebookMarketingVisuals'
import { GRADEBOOK_CANONICAL } from './gradebookMarketingSeoRoutes'

export function GradebookMarketingPage() {
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      <Seo
        title="Online gradebook for teachers & schools | Grading software | Santa Isabel Escola"
        description="Gradebook software for schools: online gradebook for teachers, weighted grades, assessment types, assignment-based entry, and consistent term and year averages—inside your school platform."
        canonicalPath={GRADEBOOK_CANONICAL}
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
              Online gradebook & grading software for schools
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              Give teachers a fast <strong className="text-text">digital gradebook</strong> for daily marks, with{' '}
              <strong className="text-text">weighted averages</strong>, <strong className="text-text">assessment types</strong>, and{' '}
              <strong className="text-text">year grades</strong> that follow your school’s rules—on the same{' '}
              <strong className="text-text">school platform</strong> where students later view their results.
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
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Gradebook, weighted grades & final averages in one place</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            Whether you say <strong className="text-text">gradebook software</strong>, <strong className="text-text">grading software for teachers</strong>, or{' '}
            <strong className="text-text">school gradebook system</strong>, the need is the same: enter marks per assignment, respect categories and weights, and end up with{' '}
            <strong className="text-text">term</strong> and <strong className="text-text">year</strong> results parents and leaders can trust.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            This module connects to <strong className="text-text">assignments</strong> and your <strong className="text-text">academic structure</strong> (years, terms, subjects, classes), so teachers are not copying columns from spreadsheets into a separate{' '}
            <strong className="text-text">teacher gradebook app</strong>.
          </p>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">What it looks like in the app</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            Below: a teacher <strong className="text-text">online gradebook</strong> layout and a student grades view. Sample data only—on a demo you see your real classes and scale (for example 0–20).
          </p>
          <GradebookMarketingVisuals />
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Who it is for</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Teachers</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong className="text-text">Assignment-based grade entry</strong> with a clear student list, filters by year, term, subject, and class, and less time reconciling marks at the end of term.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">School leaders</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                More consistent <strong className="text-text">grading criteria</strong> and <strong className="text-text">assessment types</strong> across departments, so <strong className="text-text">weighted grade</strong> rules are applied the same way for every class.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Students & families</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Transparent <strong className="text-text">student gradebook</strong> view: assignment marks and averages with the same structure teachers use, so report conversations match what the system shows.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">What it covers</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Entry & class views</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Work <strong className="text-text">gradebook for multiple classes</strong> without losing context: cascade from school year to term, subject, and class so each screen stays focused.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Weights & assessment types</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Define <strong className="text-text">homework, tests, projects</strong>, and other assessment types with weights that drive <strong className="text-text">automatic</strong> term and year calculations once marks are in.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Year grades</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Reduce manual recalculation: the platform supports <strong className="text-text">year grade</strong> logic aligned to how your school counts terms and components.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Typical teacher workflow</h2>
          <ol className="mt-6 list-none space-y-4 p-0 m-0">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">1</span>
              <p className="text-base leading-relaxed text-muted">
                <strong className="text-text">Select year and term</strong> so only current classes appear.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">2</span>
              <p className="text-base leading-relaxed text-muted">
                <strong className="text-text">Pick subject and class</strong>, then the assignment you are grading.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">3</span>
              <p className="text-base leading-relaxed text-muted">
                <strong className="text-text">Enter or update marks</strong> for each student in one vertical list.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">4</span>
              <p className="text-base leading-relaxed text-muted">
                <strong className="text-text">Publish or save</strong> according to your school process; averages update from your grading rules.
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
                <strong className="text-text">Online gradebook for teachers</strong> with assignment-first entry.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong className="text-text">Weighted grading</strong> and assessment-type breakdowns.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong className="text-text">Cascading filters</strong> (year → term → subject → class).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong className="text-text">Student-facing grades</strong> tied to the same data teachers maintain.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-1 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong className="text-text">Same school platform</strong> as timetables, attendance, and assignments—see{' '}
                <Link to="/school-management-system" className="font-medium text-primary underline underline-offset-2 hover:text-primary-600">
                  school management system
                </Link>
                .
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">What this is not</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            This is <strong className="text-text">grading and gradebook workflow software</strong> inside your school platform—not a national exams registry, a learning management system for full course authoring, or a parent-only app without the rest of the school data behind it.
          </p>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Frequently asked questions</h2>
          <div className="mt-8 space-y-3">
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Is this an online gradebook for teachers?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                Yes. Teachers work in a <strong className="text-text">browser-based gradebook</strong>: choose class and assignment, enter marks, and rely on your school’s <strong className="text-text">weights</strong> and <strong className="text-text">assessment types</strong> for averages—without exporting to a separate spreadsheet gradebook unless you want to.
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Does it support weighted grades?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                Yes. You set <strong className="text-text">grading criteria</strong> and weights (for example tests vs homework). The system uses those rules when computing <strong className="text-text">term</strong> and <strong className="text-text">year</strong> results, so teachers are not hand-calculating weighted averages for every student.
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Can students see their grades in the same platform?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                Yes. Students use the student portal to view <strong className="text-text">grades by term and subject</strong>, aligned with what teachers entered—so everyone refers to the same numbers.
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Do we need a separate teacher gradebook app?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                No. The <strong className="text-text">teacher portal</strong> includes gradebook, assignments, attendance, and schedule in one login. That reduces context switching compared to using a standalone grading-only tool.
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                What grading scale do you support?
                <svg className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                Your school configures scales and score ranges (for example <strong className="text-text">0–20</strong>) in academic setup. The gradebook respects that scale for entry and display.
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-700 px-6 py-14 text-center shadow-2xl shadow-primary/20 sm:px-12 sm:py-20">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">See it with your grading policy</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
              Bring your weights and assessment types to a short demo—we map them to the gradebook and show how term and year averages behave.
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
                to="/features/school-timetable"
                className="w-full rounded-xl border border-white/30 px-8 py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-white/10 sm:w-auto no-underline"
              >
                Timetable & classes
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
              to="/school-management-system"
              className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline"
            >
              <h3 className="text-lg font-semibold text-text transition-colors group-hover:text-primary">School management system</h3>
              <p className="mt-2 text-sm text-muted">How gradebook fits with attendance, fees, and timetables.</p>
            </Link>
            <Link
              to="/features/school-timetable"
              className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline"
            >
              <h3 className="text-lg font-semibold text-text transition-colors group-hover:text-primary">School timetable</h3>
              <p className="mt-2 text-sm text-muted">Classes and terms that match gradebook filters.</p>
            </Link>
            <Link
              to="/features/role-based-access"
              className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline"
            >
              <h3 className="text-lg font-semibold text-text transition-colors group-hover:text-primary">Role-based access</h3>
              <p className="mt-2 text-sm text-muted">Teachers vs students vs admins.</p>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
