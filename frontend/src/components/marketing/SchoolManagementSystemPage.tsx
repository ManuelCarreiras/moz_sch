import { Link, useNavigate } from 'react-router-dom'
import { MarketingLayout } from './MarketingLayout'
import { Seo } from './Seo'

export function SchoolManagementSystemPage() {
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      <Seo
        title="School management system | Santa Isabel Escola"
        description="A modern school management system with role-based portals for admin, teachers, students, and finance teams."
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-text sm:text-5xl">School management system</h1>
            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              Manage daily school operations in one place: gradebook, attendance, timetables, assignments, and financial workflows.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                className="w-full cursor-pointer rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-xl sm:w-auto"
                type="button"
                onClick={() => navigate('/contact')}
              >
                Request a demo
              </button>
              <Link className="w-full rounded-xl border border-border px-8 py-3.5 text-center text-base font-semibold text-text transition-all hover:border-primary/50 hover:bg-surface sm:w-auto no-underline" to="/features">
                Explore features
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Built around real school roles</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Administrators & secretaries</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Set up academic structure, manage students, guardians, and classes.</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Teachers</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Create assignments, take attendance, and manage gradebook workflows.</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Students</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">View grades, schedules, attendance, and assignments with clear filters.</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-lg font-semibold text-text">Finance</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Track fees and manage monthly salary workflows with paid/unpaid status.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Start with the highest-intent features</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline" to="/features/gradebook">
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">Gradebook</h3>
              <p className="mt-2 text-sm text-muted">Weighted averages, year grades, and efficient entry.</p>
            </Link>
            <Link className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline" to="/features/school-timetable">
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">Timetable</h3>
              <p className="mt-2 text-sm text-muted">Year/term schedules with teacher and classroom context.</p>
            </Link>
            <Link className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline" to="/features/financial-management">
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">Financial</h3>
              <p className="mt-2 text-sm text-muted">Fees + payroll operations in one workflow.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">What makes this different</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            Most school tools are either too simple (a spreadsheet replacement) or too complex (enterprise ERP). This platform sits in between: purpose-built for K-12 school operations, with modules that share data so your team does not re-enter the same information across disconnected tools.
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">How it compares</h2>
          <p className="mt-4 max-w-3xl text-base text-muted">See how a purpose-built school platform stacks up against the alternatives.</p>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-border/30">
                <tr>
                  <th className="py-3 pr-6 text-xs font-semibold uppercase tracking-wider text-muted">Capability</th>
                  <th className="py-3 pr-6 text-xs font-semibold uppercase tracking-wider text-primary">Santa Isabel</th>
                  <th className="py-3 pr-6 text-xs font-semibold uppercase tracking-wider text-muted">Spreadsheets</th>
                  <th className="py-3 pr-6 text-xs font-semibold uppercase tracking-wider text-muted">Generic ERP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                <tr>
                  <td className="py-3 pr-6 font-medium text-text">Gradebook with weighted averages</td>
                  <td className="py-3 pr-6 text-success">Built-in</td>
                  <td className="py-3 pr-6 text-muted">Manual formulas</td>
                  <td className="py-3 pr-6 text-muted">Rarely included</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 font-medium text-text">Timetable linked to classes</td>
                  <td className="py-3 pr-6 text-success">Built-in</td>
                  <td className="py-3 pr-6 text-muted">Separate file</td>
                  <td className="py-3 pr-6 text-muted">Add-on module</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 font-medium text-text">Fee & salary tracking</td>
                  <td className="py-3 pr-6 text-success">Built-in</td>
                  <td className="py-3 pr-6 text-muted">Separate file</td>
                  <td className="py-3 pr-6 text-muted">Overkill for schools</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 font-medium text-text">Role-based portals</td>
                  <td className="py-3 pr-6 text-success">5 roles</td>
                  <td className="py-3 pr-6 text-muted">None</td>
                  <td className="py-3 pr-6 text-muted">Complex setup</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 font-medium text-text">Shared student/teacher data</td>
                  <td className="py-3 pr-6 text-success">Automatic</td>
                  <td className="py-3 pr-6 text-muted">Copy-paste</td>
                  <td className="py-3 pr-6 text-muted">Integration work</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 font-medium text-text">Setup complexity</td>
                  <td className="py-3 pr-6 text-success">Days</td>
                  <td className="py-3 pr-6 text-muted">Immediate but fragile</td>
                  <td className="py-3 pr-6 text-muted">Months</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonial placeholder */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-text sm:text-3xl">What schools say</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="text-sm italic leading-relaxed text-muted">
                "Having grades, fees, and timetables in one place saved our secretary hours every week. We stopped losing track of who paid."
              </p>
              <div className="mt-4 border-t border-border/30 pt-4">
                <p className="text-sm font-semibold text-text">School Administrator</p>
                <p className="text-xs text-muted">K-12 school, Maputo</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="text-sm italic leading-relaxed text-muted">
                "Teachers enter grades once and the system handles averages. No more end-of-term spreadsheet panic."
              </p>
              <div className="mt-4 border-t border-border/30 pt-4">
                <p className="text-sm font-semibold text-text">Head of Department</p>
                <p className="text-xs text-muted">Secondary school</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="text-sm italic leading-relaxed text-muted">
                "Parents can check their child's schedule and grades without calling the office. That alone was worth the switch."
              </p>
              <div className="mt-4 border-t border-border/30 pt-4">
                <p className="text-sm font-semibold text-text">School Director</p>
                <p className="text-xs text-muted">Primary school</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-700 px-6 py-14 text-center shadow-2xl shadow-primary/20 sm:px-12 sm:py-20">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Bring your school onto one platform</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
              Talk through your roles, modules, and rollout—see how gradebook, timetable, and finance connect without duplicate data entry.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                className="w-full cursor-pointer rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg transition-all hover:bg-slate-50 sm:w-auto"
                type="button"
                onClick={() => navigate('/contact')}
              >
                Request a demo
              </button>
              <Link className="w-full rounded-xl border border-white/30 px-8 py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-white/10 sm:w-auto no-underline" to="/features">
                Explore features
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-text sm:text-3xl">Related</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline" to="/features/gradebook">
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">Gradebook</h3>
              <p className="mt-2 text-sm text-muted">Weighted grades and assignment-based entry for teachers.</p>
            </Link>
            <Link className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline" to="/features/school-timetable">
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">School timetable</h3>
              <p className="mt-2 text-sm text-muted">Year and term schedules with teacher and classroom context.</p>
            </Link>
            <Link className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline" to="/features/financial-management">
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">Financial management</h3>
              <p className="mt-2 text-sm text-muted">Fees and payroll workflows in one place.</p>
            </Link>
            <Link className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg no-underline" to="/features/role-based-access">
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">Role-based access</h3>
              <p className="mt-2 text-sm text-muted">Portals and permissions for admin, teachers, students, and finance.</p>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
