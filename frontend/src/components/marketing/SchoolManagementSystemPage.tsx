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

      <section className="marketing__hero">
        <h1>School management system</h1>
        <p className="marketing__subtitle">
          Manage daily school operations in one place: gradebook, attendance, timetables, assignments, and financial workflows.
        </p>
        <div className="hero__actions">
          <button className="btn btn--primary" onClick={() => navigate('/login')}>Request a demo</button>
          <Link className="btn" to="/features">Explore features</Link>
        </div>
      </section>

      <section className="marketing__section">
        <h2>Built around real school roles</h2>
        <div className="marketing__grid">
          <div className="marketing__panel">
            <h3>Administrators & secretaries</h3>
            <p>Set up academic structure, manage students, guardians, and classes.</p>
          </div>
          <div className="marketing__panel">
            <h3>Teachers</h3>
            <p>Create assignments, take attendance, and manage gradebook workflows.</p>
          </div>
          <div className="marketing__panel">
            <h3>Students</h3>
            <p>View grades, schedules, attendance, and assignments with clear filters.</p>
          </div>
          <div className="marketing__panel">
            <h3>Finance</h3>
            <p>Track fees and manage monthly salary workflows with paid/unpaid status.</p>
          </div>
        </div>
      </section>

      <section className="marketing__section">
        <h2>Start with the highest-intent features</h2>
        <div className="marketing__ctaCards">
          <Link className="marketing__ctaCard" to="/features/gradebook">
            <strong>Gradebook</strong>
            <span>Weighted averages, year grades, and efficient entry.</span>
          </Link>
          <Link className="marketing__ctaCard" to="/features/school-timetable">
            <strong>Timetable</strong>
            <span>Year/term schedules with teacher and classroom context.</span>
          </Link>
          <Link className="marketing__ctaCard" to="/features/financial-management">
            <strong>Financial</strong>
            <span>Fees + payroll operations in one workflow.</span>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
}

