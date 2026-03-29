import { Link, useNavigate } from 'react-router-dom'
import { MarketingLayout } from './MarketingLayout'
import { Seo } from './Seo'
import { TimetableMarketingVisuals } from './TimetableMarketingVisuals'
import { TIMETABLE_CANONICAL } from './timetableMarketingSeoRoutes'

export function TimetableMarketingPage() {
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      <Seo
        title="School timetable & class scheduling software | Student & teacher schedules | Santa Isabel Escola"
        description="School timetable software and class scheduling for K–12: student schedule online, teacher timetable, periods and terms, rooms and subjects—inside your school platform."
        canonicalPath={TIMETABLE_CANONICAL}
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
              School timetable & class scheduling software
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              Publish a clear <strong>weekly timetable</strong> so <strong>students</strong> see their{' '}
              <strong>class schedule online</strong> and <strong>teachers</strong> see <strong>which class</strong> they
              teach in <strong>each period</strong>—filtered by <strong>school year</strong> and <strong>term</strong> on
              the same <strong>school platform</strong> as attendance and grades.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                className="w-full cursor-pointer rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-xl sm:w-auto"
                type="button"
                onClick={() => navigate('/contact')}
              >
                Request a demo
              </button>
              <Link
                className="w-full rounded-xl border border-border px-8 py-3.5 text-center text-base font-semibold text-text transition-all hover:border-primary/50 hover:bg-surface sm:w-auto no-underline"
                to="/features"
              >
                All features
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Timetable, scheduling & daily clarity</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            Schools look for <strong>school timetable software</strong>, <strong>class scheduling software</strong>, or a
            simple <strong>timetable planner</strong> for the same problem: turn your structure (years, terms, periods,
            rooms) into a <strong>schedule</strong> everyone can open without asking the office.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            <strong>Student timetable</strong> and <strong>teacher timetable</strong> views read the same underlying
            timetable, so there is no mismatch between what the teacher expects in period 3 and what the student sees on
            their phone.
          </p>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">What it looks like in the app</h2>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted">
            Examples below: teacher week grid and student week list. Sample data only—on a demo you see your real
            periods and rooms.
          </p>
          <div className="mt-8">
            <TimetableMarketingVisuals />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Who it is for</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Students & families</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A reliable <strong>student schedule online</strong> for the current term: subject, teacher, time, and
                room—so everyone knows where to be.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Teachers</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong>Teacher schedule online</strong> with the classes you teach per period, tied to the same academic
                year and term filters used elsewhere in the app.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Secretaries & admins</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Timetable work sits next to <strong>class setup</strong> and <strong>academic structure</strong>, so
                scheduling stays aligned with enrollment and the school calendar.
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
              <h3 className="text-lg font-semibold text-text">Year, term & periods</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong>Period-based</strong> timetables that respect how your school divides the day—so “period 2”
                means the same thing in scheduling, attendance, and class lists.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Context on every slot</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Entries carry <strong>subject</strong>, <strong>class</strong>, <strong>teacher</strong>, and{' '}
                <strong>classroom</strong> where configured, so screens are self-explanatory.
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Role-appropriate views</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Students see their own week; teachers see their teaching week—both driven by the same{' '}
                <strong>school scheduling</strong> data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Typical workflow</h2>
          <ol className="mt-6 list-none space-y-4 p-0 m-0">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                1
              </span>
              <span className="text-base leading-relaxed text-muted">
                <strong>Configure</strong> school years, terms, and periods in academic setup (foundation for every
                schedule).
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                2
              </span>
              <span className="text-base leading-relaxed text-muted">
                <strong>Build or import</strong> class timetables with the secretary or admin tools your school uses.
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                3
              </span>
              <span className="text-base leading-relaxed text-muted">
                <strong>Select year and term</strong> in the portal to load the right week.
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                4
              </span>
              <span className="text-base leading-relaxed text-muted">
                <strong>Teachers and students</strong> open Schedule from their portals for day-to-day use.
              </span>
            </li>
          </ol>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Key capabilities</h2>
          <ul className="mt-6 list-none space-y-3 p-0 m-0">
            <li className="flex items-start gap-3">
              <svg
                className="mt-1 h-5 w-5 shrink-0 text-success"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong>School timetable software</strong> experience in the browser—no PDF-only handouts required for
                daily checks.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="mt-1 h-5 w-5 shrink-0 text-success"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong>Term and year filters</strong> so old terms do not clutter the current week.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="mt-1 h-5 w-5 shrink-0 text-success"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong>Cascading filters</strong> consistent with gradebook, attendance, and assignments.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="mt-1 h-5 w-5 shrink-0 text-success"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-base leading-relaxed text-muted">
                <strong>Same school platform</strong> as academics and operations—see{' '}
                <Link to="/school-management-system">school management system</Link>.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">What this is not</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            This is <strong>scheduling and timetable viewing</strong> inside your school platform—not a full transport
            routing system, university-wide resource optimisation, or a generic calendar replacement for personal events
            unless you scope that separately.
          </p>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Frequently asked questions</h2>
          <div className="mt-8 space-y-3">
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Is this school scheduling software or only a viewer?
                <svg
                  className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                <p>
                  The product focuses on <strong>publishing and viewing</strong> timetables that match your school
                  structure. Building the grid uses your school’s admin and class tools; everyone else consumes the{' '}
                  <strong>class schedule online</strong> from their portal.
                </p>
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Can students see their timetable on a phone?
                <svg
                  className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                <p>
                  The interface is web-based and responsive, so families can open the <strong>student timetable</strong>{' '}
                  from a browser on mobile—subject to how you host and share the school URL.
                </p>
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Does the teacher timetable avoid double-booking?
                <svg
                  className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                <p>
                  Your school’s setup and rules aim to keep assignments consistent; the UI shows <strong>what is scheduled</strong>. Exact conflict rules depend on how classes and periods are maintained in your deployment.
                </p>
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                How does this connect to attendance and gradebook?
                <svg
                  className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                <p>
                  The same <strong>year, term, subject, and class</strong> ideas flow into <strong>attendance</strong>{' '}
                  and <strong>gradebook</strong>, so the class you see on the timetable is the class you take roll for and
                  enter marks for.
                </p>
              </div>
            </details>
            <details className="group rounded-2xl border border-border/50 bg-card">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-text">
                Semester vs term—does it matter?
                <svg
                  className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted">
                <p>
                  Labels follow your school: you can run <strong>terms</strong> or equivalent periods; the timetable
                  always keys off the <strong>academic structure</strong> you configured.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-700 px-6 py-14 text-center shadow-2xl shadow-primary/20 sm:px-12 sm:py-20">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">See your week in the product</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
              Share how many periods you run and how you name terms—we show your timetable story in a short demo.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                className="w-full cursor-pointer rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg transition-all hover:bg-slate-50 sm:w-auto"
                type="button"
                onClick={() => navigate('/contact')}
              >
                Request a demo
              </button>
              <Link
                className="w-full rounded-xl border border-white/30 px-8 py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-white/10 sm:w-auto no-underline"
                to="/features/gradebook"
              >
                Gradebook & grades
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
              className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline"
              to="/school-management-system"
            >
              <h3 className="text-lg font-semibold text-text transition-colors group-hover:text-primary">
                School management system
              </h3>
              <p className="mt-2 text-sm text-muted">Where timetable fits with fees, grades, and attendance.</p>
            </Link>
            <Link
              className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline"
              to="/features/gradebook"
            >
              <h3 className="text-lg font-semibold text-text transition-colors group-hover:text-primary">Gradebook</h3>
              <p className="mt-2 text-sm text-muted">Marks and classes aligned with the same schedule.</p>
            </Link>
            <Link
              className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline"
              to="/features/role-based-access"
            >
              <h3 className="text-lg font-semibold text-text transition-colors group-hover:text-primary">
                Role-based access
              </h3>
              <p className="mt-2 text-sm text-muted">Who sees student vs teacher schedule views.</p>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
