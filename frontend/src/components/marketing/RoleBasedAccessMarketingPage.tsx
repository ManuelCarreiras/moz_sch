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

      <section className="marketing__hero">
        <h1>Role-based access</h1>
        <p className="marketing__subtitle">
          Each role sees what they need: admins and secretaries run the school, finance handles fees and salaries, teachers manage classes, students view their own data.
        </p>
        <div className="hero__actions">
          <button className="btn btn--primary" type="button" onClick={() => navigate('/login')}>
            Request a demo
          </button>
          <Link className="btn" to="/school-management-system">
            School management overview
          </Link>
        </div>
      </section>

      <section className="marketing__section">
        <h2>Portals by role</h2>
        <div className="marketing__grid">
          <div className="marketing__panel">
            <h3>Administrator</h3>
            <p>Full access including staff management and financial tools.</p>
          </div>
          <div className="marketing__panel">
            <h3>Secretary</h3>
            <p>Students, teachers, guardians, academic setup, and classes.</p>
          </div>
          <div className="marketing__panel">
            <h3>Financial</h3>
            <p>Student fees, teacher salaries, and staff salaries.</p>
          </div>
          <div className="marketing__panel">
            <h3>Teacher</h3>
            <p>Assignments, gradebook, attendance, schedules, and resources.</p>
          </div>
          <div className="marketing__panel">
            <h3>Student</h3>
            <p>Grades, assignments, attendance, schedule, and resources.</p>
          </div>
        </div>
      </section>

      <section className="marketing__section">
        <h2>Security model</h2>
        <ul className="marketing__list">
          <li><strong>Authentication</strong> via AWS Cognito with email login.</li>
          <li><strong>Authorization</strong> enforced on the API so sensitive actions stay server-side.</li>
          <li><strong>Separation</strong> so finance data and academic admin tools are not exposed to student accounts.</li>
        </ul>
      </section>
    </MarketingLayout>
  )
}
