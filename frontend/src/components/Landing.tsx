import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MarketingLayout } from './marketing/MarketingLayout'
import { Seo } from './marketing/Seo'

export function Landing() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      <Seo
        title="Escola Santa Isabel — School Management Platform"
        description="All-in-one school management platform: gradebook, timetable, financial management, and role-based access in one system."
        canonicalPath="/"
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-text sm:text-5xl lg:text-6xl">
              {t('landing.title')}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              {t('landing.subtitle')}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
                onClick={() => navigate('/contact')}
              >
                Request a Demo
              </button>
              <Link
                to="/features"
                className="w-full rounded-xl border border-border px-8 py-3.5 text-center text-base font-semibold text-text transition-all hover:border-primary/50 hover:bg-surface sm:w-auto no-underline"
              >
                {t('landing.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core features */}
      <section className="border-t border-border/30 bg-surface/30 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-text sm:text-3xl">{t('landing.features')}</h2>
            <p className="mt-3 text-base text-muted">Everything your school needs in one platform</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text">{t('landing.feature1Title')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t('landing.feature1Desc')}</p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text">{t('landing.feature2Title')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t('landing.feature2Desc')}</p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text">{t('landing.feature3Title')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t('landing.feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Module deep-links */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-text sm:text-3xl">Explore our modules</h2>
            <p className="mt-3 text-base text-muted">Purpose-built tools for every part of school operations</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-6 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              onClick={() => navigate('/features/gradebook')}
            >
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">Gradebook &amp; grading</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Fast grade entry and consistent calculations with weighting and year grades.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Learn more
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </span>
            </button>

            <button
              type="button"
              className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-6 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              onClick={() => navigate('/features/school-timetable')}
            >
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">School timetable</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Clear schedules for students and teachers, organized by school year and term.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Learn more
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </span>
            </button>

            <button
              type="button"
              className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-6 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              onClick={() => navigate('/features/financial-management')}
            >
              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">Financial management</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Track student fees and manage teacher/staff salaries with paid/unpaid status.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Learn more
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Social proof placeholder */}
      <section className="border-t border-border/30 bg-surface/30 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-wider text-muted">Trusted by schools worldwide</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="text-center">
              <p className="text-3xl font-bold text-text">500+</p>
              <p className="text-sm text-muted">Students managed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-text">50+</p>
              <p className="text-sm text-muted">Teachers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-text">4</p>
              <p className="text-sm text-muted">Core modules</p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-700 px-6 py-14 text-center shadow-2xl shadow-primary/20 sm:px-12 sm:py-20">
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Ready to modernize your school?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
              See how Santa Isabel's platform can replace spreadsheets and disconnected tools with one unified system.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg transition-all hover:bg-slate-50 hover:shadow-xl sm:w-auto"
                onClick={() => navigate('/contact')}
              >
                Request a Demo
              </button>
              <Link
                to="/features"
                className="w-full rounded-xl border border-white/30 px-8 py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-white/10 sm:w-auto no-underline"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
