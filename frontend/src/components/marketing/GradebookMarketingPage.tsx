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

      <section className="marketing__hero">
        <h1>Online gradebook & grading software for schools</h1>
        <p className="marketing__subtitle">
          Give teachers a fast <strong>digital gradebook</strong> for daily marks, with <strong>weighted averages</strong>, <strong>assessment types</strong>, and <strong>year grades</strong> that follow your school’s rules—on the same <strong>school platform</strong> where students later view their results.
        </p>
        <div className="hero__actions">
          <button className="btn btn--primary" type="button" onClick={() => navigate('/login')}>
            Request a demo
          </button>
          <Link className="btn" to="/features">
            All features
          </Link>
        </div>
      </section>

      <section className="marketing__section">
        <h2>Gradebook, weighted grades & final averages in one place</h2>
        <p className="marketing__prose">
          Whether you say <strong>gradebook software</strong>, <strong>grading software for teachers</strong>, or <strong>school gradebook system</strong>, the need is the same: enter marks per assignment, respect categories and weights, and end up with <strong>term</strong> and <strong>year</strong> results parents and leaders can trust.
        </p>
        <p className="marketing__prose">
          This module connects to <strong>assignments</strong> and your <strong>academic structure</strong> (years, terms, subjects, classes), so teachers are not copying columns from spreadsheets into a separate <strong>teacher gradebook app</strong>.
        </p>
      </section>

      <section className="marketing__section">
        <h2>What it looks like in the app</h2>
        <p className="marketing__prose marketing__prose--tight">
          Below: a teacher <strong>online gradebook</strong> layout and a student grades view. Sample data only—on a demo you see your real classes and scale (for example 0–20).
        </p>
        <GradebookMarketingVisuals />
      </section>

      <section className="marketing__section">
        <h2>Who it is for</h2>
        <div className="marketing__grid">
          <div className="marketing__panel">
            <h3>Teachers</h3>
            <p>
              <strong>Assignment-based grade entry</strong> with a clear student list, filters by year, term, subject, and class, and less time reconciling marks at the end of term.
            </p>
          </div>
          <div className="marketing__panel">
            <h3>School leaders</h3>
            <p>
              More consistent <strong>grading criteria</strong> and <strong>assessment types</strong> across departments, so <strong>weighted grade</strong> rules are applied the same way for every class.
            </p>
          </div>
          <div className="marketing__panel">
            <h3>Students & families</h3>
            <p>
              Transparent <strong>student gradebook</strong> view: assignment marks and averages with the same structure teachers use, so report conversations match what the system shows.
            </p>
          </div>
        </div>
      </section>

      <section className="marketing__section">
        <h2>What it covers</h2>
        <div className="marketing__grid">
          <div className="marketing__panel">
            <h3>Entry & class views</h3>
            <p>
              Work <strong>gradebook for multiple classes</strong> without losing context: cascade from school year to term, subject, and class so each screen stays focused.
            </p>
          </div>
          <div className="marketing__panel">
            <h3>Weights & assessment types</h3>
            <p>
              Define <strong>homework, tests, projects</strong>, and other assessment types with weights that drive <strong>automatic</strong> term and year calculations once marks are in.
            </p>
          </div>
          <div className="marketing__panel">
            <h3>Year grades</h3>
            <p>
              Reduce manual recalculation: the platform supports <strong>year grade</strong> logic aligned to how your school counts terms and components.
            </p>
          </div>
        </div>
      </section>

      <section className="marketing__section">
        <h2>Typical teacher workflow</h2>
        <ol className="marketing__list marketing__list--numbered">
          <li><strong>Select year and term</strong> so only current classes appear.</li>
          <li><strong>Pick subject and class</strong>, then the assignment you are grading.</li>
          <li><strong>Enter or update marks</strong> for each student in one vertical list.</li>
          <li><strong>Publish or save</strong> according to your school process; averages update from your grading rules.</li>
        </ol>
      </section>

      <section className="marketing__section">
        <h2>Key capabilities</h2>
        <ul className="marketing__list">
          <li><strong>Online gradebook for teachers</strong> with assignment-first entry.</li>
          <li><strong>Weighted grading</strong> and assessment-type breakdowns.</li>
          <li><strong>Cascading filters</strong> (year → term → subject → class).</li>
          <li><strong>Student-facing grades</strong> tied to the same data teachers maintain.</li>
          <li><strong>Same school platform</strong> as timetables, attendance, and assignments—see <Link to="/school-management-system">school management system</Link>.</li>
        </ul>
      </section>

      <section className="marketing__section">
        <h2>What this is not</h2>
        <p className="marketing__prose">
          This is <strong>grading and gradebook workflow software</strong> inside your school platform—not a national exams registry, a learning management system for full course authoring, or a parent-only app without the rest of the school data behind it.
        </p>
      </section>

      <section className="marketing__section">
        <h2>Frequently asked questions</h2>
        <div className="marketing__faq">
          <details className="marketing__faqItem">
            <summary>Is this an online gradebook for teachers?</summary>
            <p>
              Yes. Teachers work in a <strong>browser-based gradebook</strong>: choose class and assignment, enter marks, and rely on your school’s <strong>weights</strong> and <strong>assessment types</strong> for averages—without exporting to a separate spreadsheet gradebook unless you want to.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>Does it support weighted grades?</summary>
            <p>
              Yes. You set <strong>grading criteria</strong> and weights (for example tests vs homework). The system uses those rules when computing <strong>term</strong> and <strong>year</strong> results, so teachers are not hand-calculating weighted averages for every student.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>Can students see their grades in the same platform?</summary>
            <p>
              Yes. Students use the student portal to view <strong>grades by term and subject</strong>, aligned with what teachers entered—so everyone refers to the same numbers.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>Do we need a separate teacher gradebook app?</summary>
            <p>
              No. The <strong>teacher portal</strong> includes gradebook, assignments, attendance, and schedule in one login. That reduces context switching compared to using a standalone grading-only tool.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>What grading scale do you support?</summary>
            <p>
              Your school configures scales and score ranges (for example <strong>0–20</strong>) in academic setup. The gradebook respects that scale for entry and display.
            </p>
          </details>
        </div>
      </section>

      <section className="marketing__section marketing__section--cta">
        <h2>See it with your grading policy</h2>
        <p className="marketing__prose">
          Bring your weights and assessment types to a short demo—we map them to the gradebook and show how term and year averages behave.
        </p>
        <div className="hero__actions">
          <button className="btn btn--primary" type="button" onClick={() => navigate('/login')}>
            Request a demo
          </button>
          <Link className="btn" to="/features/school-timetable">
            Timetable & classes
          </Link>
        </div>
      </section>

      <section className="marketing__section">
        <h2>Related</h2>
        <div className="marketing__ctaCards">
          <Link className="marketing__ctaCard" to="/school-management-system">
            <strong>School management system</strong>
            <span>How gradebook fits with attendance, fees, and timetables.</span>
          </Link>
          <Link className="marketing__ctaCard" to="/features/school-timetable">
            <strong>School timetable</strong>
            <span>Classes and terms that match gradebook filters.</span>
          </Link>
          <Link className="marketing__ctaCard" to="/features/role-based-access">
            <strong>Role-based access</strong>
            <span>Teachers vs students vs admins.</span>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
}
