import { Link } from 'react-router-dom'
import { MarketingLayout } from './MarketingLayout'
import { Seo } from './Seo'

export function MarketingFeatures() {
  return (
    <MarketingLayout>
      <Seo
        title="School software features | Santa Isabel Escola"
        description="Explore Gradebook, Timetable, and Financial management features for school operations."
      />

      <section className="marketing__hero">
        <h1>Features</h1>
        <p className="marketing__subtitle">
          Start with the wedges that map to the highest-intent searches: gradebook, timetabling, and financial operations.
        </p>
      </section>

      <section className="features marketing__cards">
        <Link className="feature marketing__cardLink" to="/features/gradebook">
          <h3>Gradebook & grading</h3>
          <p>Fast grade entry and consistent calculations with weighting and year grades.</p>
        </Link>
        <Link className="feature marketing__cardLink" to="/features/school-timetable">
          <h3>School timetable</h3>
          <p>Clear schedules for students and teachers, organized by school year and term.</p>
        </Link>
        <Link className="feature marketing__cardLink" to="/features/financial-management">
          <h3>Financial management</h3>
          <p>Track student fees and manage teacher/staff salaries with paid/unpaid status.</p>
        </Link>
      </section>
    </MarketingLayout>
  )
}

