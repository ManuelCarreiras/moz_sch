/**
 * Canonical URL for the financial wedge money page.
 * Extra paths redirect here so keyword-style URLs land on one page (avoids duplicate content).
 */
export const FINANCIAL_MANAGEMENT_CANONICAL = '/features/financial-management'

/**
 * Slugs served at /features/{slug} → redirect to canonical.
 * Derived from the financial keyword map (fees, tuition, billing, payroll, salaries).
 */
export const FINANCIAL_MANAGEMENT_FEATURE_ALIASES: string[] = [
  'school-fees',
  'school-fee-management',
  'school-fee-management-software',
  'tuition-management',
  'tuition-management-software',
  'school-billing',
  'school-billing-software',
  'school-payroll',
  'school-payroll-software',
  'teacher-salary-management',
  'staff-salary-management',
  'monthly-school-fees',
  'student-fee-management',
  'fee-management-school',
]

/**
 * Top-level paths → same canonical (broader entry points; keep list short to avoid clashes).
 */
export const FINANCIAL_MANAGEMENT_ROOT_ALIASES: string[] = [
  'school-fee-management',
  'tuition-management',
  'school-billing',
]
