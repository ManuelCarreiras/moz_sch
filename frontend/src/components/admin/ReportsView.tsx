export function ReportsView() {
  return (
    <div className="reports-view">
      <div className="reports-header">
        <h2>Reports & Analytics</h2>
        <p>Generate academic reports and analytics for school administration</p>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <div className="report-card__icon">📊</div>
          <h3>Student Reports</h3>
          <p>Generate student enrollment, academic progress, and attendance reports</p>
          <button className="btn btn--primary">Generate Report</button>
        </div>

        <div className="report-card">
          <div className="report-card__icon">👨‍🏫</div>
          <h3>Teacher Reports</h3>
          <p>View teacher assignments, class loads, and performance analytics</p>
          <button className="btn btn--primary">Generate Report</button>
        </div>

        <div className="report-card">
          <div className="report-card__icon">📚</div>
          <h3>Class Reports</h3>
          <p>Analyze class schedules, capacity utilization, and subject distribution</p>
          <button className="btn btn--primary">Generate Report</button>
        </div>

        <div className="report-card">
          <div className="report-card__icon">📈</div>
          <h3>Academic Analytics</h3>
          <p>Track academic performance trends and generate comprehensive analytics</p>
          <button className="btn btn--primary">View Analytics</button>
        </div>
      </div>

      <div className="reports-section">
        <h3>Quick Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">0</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">0</div>
            <div className="stat-label">Active Teachers</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">0</div>
            <div className="stat-label">Active Classes</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">0</div>
            <div className="stat-label">Subjects</div>
          </div>
        </div>
      </div>
    </div>
  );
}
