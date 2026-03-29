import { useMarketingImage } from './useMarketingImage'
import { FinancialModulePreview } from './FinancialModulePreview'
import { SalaryGridPreview } from './SalaryGridPreview'

const MENSALITY_SRC = '/marketing/finance-mensality.png'
const SALARY_GRID_SRC = '/marketing/finance-salary-grid.png'

/**
 * Real screenshots: add PNG files under frontend/public/marketing/
 *   - finance-mensality.png
 *   - finance-salary-grid.png
 * If a file is missing, a stylized preview is shown instead.
 */
export function FinancialMarketingVisuals() {
  const mensality = useMarketingImage(MENSALITY_SRC)
  const salaryGrid = useMarketingImage(SALARY_GRID_SRC)

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <figure>
        <div>
          {mensality === 'ok' ? (
            <img
              className="w-full rounded-2xl border border-border/50 shadow-lg"
              src={MENSALITY_SRC}
              alt="School fee screen with month filters and a list of students showing paid and unpaid monthly fees"
            />
          ) : (
            <FinancialModulePreview />
          )}
        </div>
        <figcaption className="mt-3 text-center text-sm text-muted">
          Monthly fees (mensality): filters and paid/unpaid list.
        </figcaption>
      </figure>

      <figure>
        <div>
          {salaryGrid === 'ok' ? (
            <img
              className="w-full rounded-2xl border border-border/50 shadow-lg"
              src={SALARY_GRID_SRC}
              alt="Teacher salary grid showing base salaries before generating monthly payroll"
            />
          ) : (
            <SalaryGridPreview />
          )}
        </div>
        <figcaption className="mt-3 text-center text-sm text-muted">
          Salary grid: base amounts, then generate monthly salary lines.
        </figcaption>
      </figure>
    </div>
  )
}
