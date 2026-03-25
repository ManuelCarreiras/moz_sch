import { Link, useNavigate } from 'react-router-dom'
import { MarketingLayout } from './MarketingLayout'
import { Seo } from './Seo'
import { FinancialMarketingVisuals } from './FinancialMarketingVisuals'
import { FINANCIAL_MANAGEMENT_CANONICAL } from './financialManagementSeoRoutes'

export function FinancialMarketingPage() {
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      <Seo
        title="School tuition & fee management software | School platform | Santa Isabel Escola"
        description="Tuition management, school fees, and billing in one school platform: monthly fee lines, paid/unpaid tracking, teacher and staff salary grids, and generation workflows for your finance office."
        canonicalPath={FINANCIAL_MANAGEMENT_CANONICAL}
      />

      <section className="marketing__hero">
        <h1>Tuition, school fees & salary management in one platform</h1>
        <p className="marketing__subtitle">
          Run <strong>tuition and school fee billing</strong> next to <strong>teacher and staff salaries</strong>—same school platform as classes and enrollment. Filter by month, generate monthly charges, and mark fees and payroll as paid when money is received.
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
        <h2>Tuition, fees & billing without a separate tool</h2>
        <p className="marketing__prose">
          Whether your team calls it <strong>tuition management</strong>, <strong>school fees</strong>, or <strong>billing</strong>, the work is the same: monthly mensality or fee lines, who paid, and what is still open. This module keeps that work inside your <strong>school management platform</strong>, so student names and classes stay aligned with what families owe and what you have marked as paid.
        </p>
        <p className="marketing__prose">
          <strong>Teacher salary management</strong> and <strong>staff payroll records</strong> follow the same pattern: base amounts in a grid, monthly lines, due dates, and paid/unpaid status—so finance does not maintain a parallel spreadsheet for payroll alone.
        </p>
      </section>

      <section className="marketing__section">
        <h2>What it looks like in the app</h2>
        <p className="marketing__prose marketing__prose--tight">
          Your finance team works from screens like these: filters at the top, then fee or salary rows you can mark as paid. The examples below show the layout with sample data so visitors can picture the workflow—on a live demo you see your school’s real setup.
        </p>
        <FinancialMarketingVisuals />
      </section>

      <section className="marketing__section">
        <h2>Who it is for</h2>
        <div className="marketing__grid">
          <div className="marketing__panel">
            <h3>School finance teams</h3>
            <p>See what is due, what is paid, and what is still open for the month—without juggling spreadsheets for every class.</p>
          </div>
          <div className="marketing__panel">
            <h3>Heads of school & admins</h3>
            <p>Keep fee collection and payroll workflows aligned with the same student and staff records the rest of the school uses.</p>
          </div>
          <div className="marketing__panel">
            <h3>Secretaries (where applicable)</h3>
            <p>When your process mixes academic and fee follow-up, everyone works from shared, up-to-date records.</p>
          </div>
        </div>
      </section>

      <section className="marketing__section">
        <h2>What it covers</h2>
        <div className="marketing__grid">
          <div className="marketing__panel">
            <h3>Student fees & tuition</h3>
            <p>
              Monthly fee records (including <strong>mensality</strong>-style monthly billing) with filters by month, year, student, and paid/unpaid status.
              Generate charges for many students at once for a given period, then mark payments as you receive them.
            </p>
          </div>
          <div className="marketing__panel">
            <h3>Teacher salaries</h3>
            <p>
              Maintain a <strong>salary grid</strong> of base amounts, generate monthly salary records, set due dates, and track paid vs unpaid the same way you track fees.
            </p>
          </div>
          <div className="marketing__panel">
            <h3>Staff salaries</h3>
            <p>
              For administrative staff (e.g. finance and secretary roles), use a dedicated staff salary grid and monthly records so payroll is consistent across the team.
            </p>
          </div>
        </div>
      </section>

      <section className="marketing__section">
        <h2>Typical monthly workflow</h2>
        <ol className="marketing__list marketing__list--numbered">
          <li><strong>Open the right month</strong> using year and month filters so you only see current work.</li>
          <li><strong>Generate or create</strong> student fee lines and salary lines from grids where your school uses bulk generation.</li>
          <li><strong>Review unpaid</strong> using paid/unpaid filters to chase fees or confirm payroll.</li>
          <li><strong>Mark as paid</strong> when money moves, and record the payment date for your school’s records if you need it.</li>
        </ol>
      </section>

      <section className="marketing__section">
        <h2>Key capabilities</h2>
        <ul className="marketing__list">
          <li><strong>Tuition and fee records</strong> per student and month, with bulk generation when your school bills everyone the same way.</li>
          <li><strong>Monthly generation</strong> from base salary grids for teachers and staff.</li>
          <li><strong>Paid/unpaid tracking</strong> with filters so finance can work from a short list every week.</li>
          <li><strong>Role-based access</strong> so only authorized users open financial tabs—see <Link to="/features/role-based-access">role-based access</Link>.</li>
          <li><strong>Same school platform as academics</strong> so enrollment and billing stay in sync (not a disconnected billing-only tool).</li>
        </ul>
      </section>

      <section className="marketing__section">
        <h2>What this is not</h2>
        <p className="marketing__prose">
          This module is built for <strong>school fee and salary operations inside your school management platform</strong>.
          It is not a full replacement for a national-chart-of-accounts accounting suite, tax filing software, or a bank’s payment gateway—though you can describe how your school maps exports or manual journal entries if needed.
        </p>
      </section>

      <section className="marketing__section">
        <h2>Frequently asked questions</h2>
        <div className="marketing__faq">
          <details className="marketing__faqItem">
            <summary>Is this tuition management software for schools?</summary>
            <p>
              Yes, in the sense schools usually mean: <strong>track monthly tuition or school fees</strong>, see who has paid, and generate the month’s charges in one place. It is built for the <strong>school office workflow</strong> (recording and status), not for parent self-checkout unless you add a payment integration later.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>Does it work as school billing or fee collection software?</summary>
            <p>
              It gives you a <strong>clear fee ledger</strong>: amounts, due dates, month and year, and paid or unpaid. That is what most schools mean by <strong>billing</strong> or <strong>fee collection tracking</strong> day to day. Card or bank payments from parents are separate from recording what was received.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>Can parents pay online through this page?</summary>
            <p>
              Today the system is built to help your office <strong>record who owes what, generate monthly fee lines, and mark fees as paid</strong> when money arrives.
              If you want parents to pay by card online, that usually means connecting a payment provider; we can discuss that when you are ready.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>What is “mensality”?</summary>
            <p>
              It usually means the <strong>monthly school fee or tuition</strong> (one payment per month). We also say “fees” and “tuition” here so the same idea is clear for every school.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>Can teachers see fee balances?</summary>
            <p>
              Access is <strong>role-based</strong>. Financial users and admins handle fee and salary screens; teachers use the teacher portal for class work unless you explicitly give them broader access.
            </p>
          </details>
          <details className="marketing__faqItem">
            <summary>Does it replace payroll with the government or a bank?</summary>
            <p>
              No. It helps the school <strong>organize amounts, months, and paid status</strong>. Actual bank transfers and statutory payroll filings stay in your bank and accounting processes unless you integrate them separately.
            </p>
          </details>
        </div>
      </section>

      <section className="marketing__section marketing__section--cta">
        <h2>See it with your workflows</h2>
        <p className="marketing__prose">
          If you tell us how you bill (per month, per term, discounts, scholarships), we can map it to these screens in a short demo.
        </p>
        <div className="hero__actions">
          <button className="btn btn--primary" type="button" onClick={() => navigate('/login')}>
            Request a demo
          </button>
          <Link className="btn" to="/school-management-system">
            Platform overview
          </Link>
        </div>
      </section>

      <section className="marketing__section">
        <h2>Related</h2>
        <div className="marketing__ctaCards">
          <Link className="marketing__ctaCard" to="/features/role-based-access">
            <strong>Role-based access</strong>
            <span>Who can open financial management and who cannot.</span>
          </Link>
          <Link className="marketing__ctaCard" to="/school-management-system">
            <strong>School management system</strong>
            <span>How finance connects to gradebook, attendance, and timetables.</span>
          </Link>
          <Link className="marketing__ctaCard" to="/features/gradebook">
            <strong>Gradebook</strong>
            <span>Academic operations that sit alongside finance in one platform.</span>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
}
