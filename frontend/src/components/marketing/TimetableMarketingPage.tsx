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

      <section className="marketing__hero">
        <h1>School timetable & class scheduling software</h1>
        <p className="marketing__subtitle">
          Publish a clear <strong>weekly timetable</strong> so <strong>students</strong> see their <strong>class schedule online</strong> and <strong>teachers</strong> see <strong>which class</strong> they teach in <strong>each period</strong>—filtered by <strong>school year</strong> and <strong>term</strong> on the same <strong>school platform</strong> as attendance and grades.
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
        <h2>Timetable, scheduling & daily clarity</h2>
        <p className="marketing__prose">
          Schools look for <strong>school timetable software</strong>, <strong>class scheduling software</strong>, or a simple <strong>timetable planner</strong> for the same problem: turn your structure (years, terms, periods, rooms) into a <strong>schedule</strong> everyone can open without asking the office.
        </p>
        <p className="marketing__prose">
          <strong>Student timetable</strong> and <strong>teacher timetable</strong> views read the same underlying timetable, so there is no mismatch between what the teacher expects in period 3 and what the student sees on their phone.
        </p>
      </section>

      <section className="marketing__section">
        <h2>What it looks like in the app</h2>
        <p className="marketing__prose marketing__prose--tight">
          Examples below: teacher week grid and student week list. Sample data only—on a demo you see your real periods and rooms.
        </p>
        <TimetableMarketingVisuals />
      </section>

      <section className="marketing__section">
        <h2>Who it is for</h2>
        <div className="marketing__grid">
          <div className="marketing__panel">
            <h3>Students & families</h3>
            <p>
              A reliable <strong>student schedule online</strong> for the current term: subject, teacher, time, and room—so everyone knows where to be.
            </p>
          </div>
          <div className="marketing__panel">
            <h3>Teachers</h3>
            <p>
              <strong>Teacher schedule online</strong> with the classes you teach per period, tied to the same academic year and term filters used elsewhere in the app.
            </p>
          </div>
          <div className="marketing__panel">
            <h3>Secretaries & admins</h3>
            <p>
              Timetable work sits next to <strong>class setup</strong> and <strong>academic structure</strong>, so scheduling stays aligned with enrollment and the school calendar.
            </p>
          </div>
        </div>
      </section>

      <section className="marketing__section">
        <h2>What it covers</h2>
        <div className="marketing__grid">
          <div className="marketing__panel">
            <h3>Year, term & periods</h3>
            <p>
              <strong>Period-based</strong> timetables that respect how your school divides the day—so “period 2” means the same thing in scheduling, attendance, and class lists.
            </p>
          </div>
          <div className="marketing__panel">
            <h3>Context on every slot</h3>
            <p>
              Entries carry <strong>subject</strong>, <strong>class</strong>, <strong>teacher</strong>, and <strong>classroom</strong> where configured, so screens are self-explanatory.
            </p>
          </div>
          <div className="marketing__panel">
            <h3>Role-appropriate views</h3>
            <p>
              Students see their own week; teachers see their teaching week—both driven by the same <strong>school scheduling</strong> data.
            </p>
          </div>
        </div>
      </section>

      <section className="marketing__section">
        <h2>Typical workflow</h2>
        <ol className="marketing__list marketing__list--numbered">
          <li><strong>Configure</strong> school years, terms, and periods in academic setup (foundation for every schedule).</li>
          <li><strong>Build or import</strong> class timetables with the secretary or admin tools your school uses.</li>
          <li><strong>Select year and term</strong> in the portal to load the right week.</li>
          <li><strong>Teachers and students</strong> open Schedule from their portals for day-to-day use.</li>
        </ol>
      </section>

      <section className="marketing__section">
        <h2>Key capabilities</h2>
        <ul className="marketing__list">
          <li><strong>School timetable software</strong> experience in the browser—no PDF-only handouts required for daily checks.</li>
          <li><strong>Term and year filters</strong> so old terms do not clutter the current week.</li>
          <li><strong>Cascading filters</strong> consistent with gradebook, attendance, and assignments.</li>
          <li><strong>Same school platform</strong> as academics and operations—see <Link to="/school-management-system">school management system</Link>.</li>
        </ul>
      </section>

      <section className="marketing__section">
        <h2>What this is not</h2>
        <p className="marketing__prose">
          This is <strong>scheduling and timetable viewing</strong> inside your school platform—not a full transport routing system, university-wide resource optimisation, or a generic calendar replacement for personal events unless you scope that separately.
        </p>
      </section>

      <section className="marketing__section">
        <h2>Frequently asked questions</h2>
        <div className="marketing__faq">
          <details className="marketing__faqItem">
            <summary>Is this school scheduling software or only a viewer?</summary>
            <p>
              The product focuses on <strong>publishing and viewing</strong> timetables that match your school structure. Building the grid uses your school’s admin and class tools; everyone else consumes the <strong>class schedule online</strong> from their portal.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>Can students see their timetable on a phone?</summary>
            <p>
              The interface is web-based and responsive, so families can open the <strong>student timetable</strong> from a browser on mobile—subject to how you host and share the school URL.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>Does the teacher timetable avoid double-booking?</summary>
            <p>
              Your school’s setup and rules aim to keep assignments consistent; the UI shows <strong>what is scheduled</strong>. Exact conflict rules depend on how classes and periods are maintained in your deployment.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>How does this connect to attendance and gradebook?</summary>
            <p>
              The same <strong>year, term, subject, and class</strong> ideas flow into <strong>attendance</strong> and <strong>gradebook</strong>, so the class you see on the timetable is the class you take roll for and enter marks for.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>Semester vs term—does it matter?</summary>
            <p>
              Labels follow your school: you can run <strong>terms</strong> or equivalent periods; the timetable always keys off the <strong>academic structure</strong> you configured.
            </p>
          </details>
        </div>
      </section>

      <section className="marketing__section marketing__section--cta">
        <h2>See your week in the product</h2>
        <p className="marketing__prose">
          Share how many periods you run and how you name terms—we show your timetable story in a short demo.
        </p>
        <div className="hero__actions">
          <button className="btn btn--primary" type="button" onClick={() => navigate('/login')}>
            Request a demo
          </button>
          <Link className="btn" to="/features/gradebook">
            Gradebook & grades
          </Link>
        </div>
      </section>

      <section className="marketing__section">
        <h2>Related</h2>
        <div className="marketing__ctaCards">
          <Link className="marketing__ctaCard" to="/school-management-system">
            <strong>School management system</strong>
            <span>Where timetable fits with fees, grades, and attendance.</span>
          </Link>
          <Link className="marketing__ctaCard" to="/features/gradebook">
            <strong>Gradebook</strong>
            <span>Marks and classes aligned with the same schedule.</span>
          </Link>
          <Link className="marketing__ctaCard" to="/features/role-based-access">
            <strong>Role-based access</strong>
            <span>Who sees student vs teacher schedule views.</span>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
}
