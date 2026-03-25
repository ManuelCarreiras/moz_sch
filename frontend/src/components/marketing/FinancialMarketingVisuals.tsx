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
    <div className="marketingVisuals">
      <figure className="marketingVisuals__figure">
        <div className="marketingVisuals__frame">
          {mensality === 'ok' ? (
            <img
              className="marketingScreenshot"
              src={MENSALITY_SRC}
              alt="School fee screen with month filters and a list of students showing paid and unpaid monthly fees"
            />
          ) : (
            <FinancialModulePreview />
          )}
        </div>
        <figcaption className="marketingVisuals__caption">
          Monthly fees (mensality): filters and paid/unpaid list.
        </figcaption>
      </figure>

      <figure className="marketingVisuals__figure">
        <div className="marketingVisuals__frame">
          {salaryGrid === 'ok' ? (
            <img
              className="marketingScreenshot"
              src={SALARY_GRID_SRC}
              alt="Teacher salary grid showing base salaries before generating monthly payroll"
            />
          ) : (
            <SalaryGridPreview />
          )}
        </div>
        <figcaption className="marketingVisuals__caption">
          Salary grid: base amounts, then generate monthly salary lines.
        </figcaption>
      </figure>
    </div>
  )
}
