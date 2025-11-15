import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

interface Mensality {
  _id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  value: number;
  paid: boolean;
  due_date: string;
  month: number;
  year: number;
  payment_date?: string | null;
  notes?: string;
}

interface Salary {
  _id: string;
  teacher_id: string;
  teacher_name?: string;
  teacher_email?: string;
  value: number;
  paid: boolean;
  due_date: string;
  month: number;
  year: number;
  payment_date?: string | null;
  notes?: string;
}

type FinancialTab = 'mensality' | 'salary';

export function FinancialManagement() {
  const [activeTab, setActiveTab] = useState<FinancialTab>('mensality');
  const [loading, setLoading] = useState(false);
  const [mensalityRecords, setMensalityRecords] = useState<Mensality[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<Salary[]>([]);
  
  // Filters
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterPaid, setFilterPaid] = useState<string>('all'); // 'all', 'paid', 'unpaid'
  const [filterStudentId, setFilterStudentId] = useState<string>('');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('');

  // Generation modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateMonth, setGenerateMonth] = useState<number>(new Date().getMonth() + 1);
  const [generateYear, setGenerateYear] = useState<number>(new Date().getFullYear());
  const [generateValue, setGenerateValue] = useState<string>('');
  const [generateDueDate, setGenerateDueDate] = useState<string>('');

  // Students and Teachers for filters/dropdowns
  const [students, setStudents] = useState<Array<{ _id: string; given_name: string; surname: string; email?: string }>>([]);
  const [teachers, setTeachers] = useState<Array<{ _id: string; given_name: string; surname: string; email_address?: string }>>([]);

  useEffect(() => {
    loadData();
    loadStudentsAndTeachers();
  }, [activeTab, filterMonth, filterYear, filterPaid, filterStudentId, filterTeacherId]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'mensality') {
        const filters: any = {
          month: filterMonth,
          year: filterYear,
        };
        if (filterStudentId) filters.student_id = filterStudentId;
        if (filterPaid !== 'all') filters.paid = filterPaid === 'paid';
        
        const response = await apiService.getMensality(filters);
        if (response.success && response.data) {
          const records = (response.data as any).mensality_records || [];
          setMensalityRecords(records);
        }
      } else {
        const filters: any = {
          month: filterMonth,
          year: filterYear,
        };
        if (filterTeacherId) filters.teacher_id = filterTeacherId;
        if (filterPaid !== 'all') filters.paid = filterPaid === 'paid';
        
        const response = await apiService.getTeacherSalary(filters);
        if (response.success && response.data) {
          const records = (response.data as any).salary_records || [];
          setSalaryRecords(records);
        }
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsAndTeachers = async () => {
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        apiService.getStudents(),
        apiService.getTeachers(),
      ]);
      if (studentsRes.success && studentsRes.data) {
        const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        setStudents(studentsData.filter((s: any) => s.is_active !== false));
      }
      if (teachersRes.success && teachersRes.data) {
        const teachersData = Array.isArray(teachersRes.data) ? teachersRes.data : [];
        setTeachers(teachersData);
      }
    } catch (error) {
      console.error('Error loading students/teachers:', error);
    }
  };

  const handleMarkAsPaid = async (id: string, type: 'mensality' | 'salary') => {
    try {
      const updateData = {
        _id: id,
        paid: true,
        payment_date: new Date().toISOString().split('T')[0],
      };
      
      const response = type === 'mensality'
        ? await apiService.updateMensality(updateData)
        : await apiService.updateTeacherSalary(updateData);
      
      if (response.success) {
        loadData();
      } else {
        alert(response.error || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Error updating payment status');
    }
  };

  const handleMarkAsUnpaid = async (id: string, type: 'mensality' | 'salary') => {
    try {
      const updateData = {
        _id: id,
        paid: false,
        payment_date: null,
      };
      
      const response = type === 'mensality'
        ? await apiService.updateMensality(updateData)
        : await apiService.updateTeacherSalary(updateData);
      
      if (response.success) {
        loadData();
      } else {
        alert(response.error || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Error updating payment status');
    }
  };

  const handleGenerate = async () => {
    if (!generateValue || !generateDueDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const generateData = {
        month: generateMonth,
        year: generateYear,
        value: parseFloat(generateValue),
        due_date: generateDueDate,
      };

      const response = activeTab === 'mensality'
        ? await apiService.generateMensality(generateData)
        : await apiService.generateTeacherSalary(generateData);

      if (response.success) {
        alert(`Successfully generated ${(response.data as any).created || 0} records`);
        setShowGenerateModal(false);
        setGenerateValue('');
        loadData();
      } else {
        alert(response.error || 'Failed to generate records');
      }
    } catch (error) {
      console.error('Error generating records:', error);
      alert('Error generating records');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getMonthName = (month: number) => {
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month] || month.toString();
  };

  const totalPaid = activeTab === 'mensality'
    ? mensalityRecords.filter(r => r.paid).reduce((sum, r) => sum + r.value, 0)
    : salaryRecords.filter(r => r.paid).reduce((sum, r) => sum + r.value, 0);

  const totalUnpaid = activeTab === 'mensality'
    ? mensalityRecords.filter(r => !r.paid).reduce((sum, r) => sum + r.value, 0)
    : salaryRecords.filter(r => !r.paid).reduce((sum, r) => sum + r.value, 0);

  const totalRecords = activeTab === 'mensality' ? mensalityRecords.length : salaryRecords.length;

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h2>Financial Management</h2>
        <button
          className="btn btn--primary"
          onClick={() => setShowGenerateModal(true)}
          style={{ marginLeft: 'var(--space-md)' }}
        >
          Generate {activeTab === 'mensality' ? 'Mensality' : 'Salaries'} for Month
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        <button
          className={`btn ${activeTab === 'mensality' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setActiveTab('mensality')}
        >
          📚 Student Mensality
        </button>
        <button
          className={`btn ${activeTab === 'salary' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setActiveTab('salary')}
        >
          💰 Teacher Salaries
        </button>
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-lg)'
      }}>
        <div style={{ padding: 'var(--space-md)', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Total Records</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}>{totalRecords}</div>
        </div>
        <div style={{ padding: 'var(--space-md)', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Total Paid</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#10b981' }}>
            {formatCurrency(totalPaid)}
          </div>
        </div>
        <div style={{ padding: 'var(--space-md)', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Total Unpaid</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#ef4444' }}>
            {formatCurrency(totalUnpaid)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-lg)',
        padding: 'var(--space-md)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>Month</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(parseInt(e.target.value))}
            style={{ width: '100%', padding: 'var(--space-sm)' }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>Year</label>
          <input
            type="number"
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
            style={{ width: '100%', padding: 'var(--space-sm)' }}
            min="2000"
            max="2100"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>Payment Status</label>
          <select
            value={filterPaid}
            onChange={(e) => setFilterPaid(e.target.value)}
            style={{ width: '100%', padding: 'var(--space-sm)' }}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
        {activeTab === 'mensality' ? (
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>Student</label>
            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              style={{ width: '100%', padding: 'var(--space-sm)' }}
            >
              <option value="">All Students</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>
                  {s.given_name} {s.surname}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>Teacher</label>
            <select
              value={filterTeacherId}
              onChange={(e) => setFilterTeacherId(e.target.value)}
              style={{ width: '100%', padding: 'var(--space-sm)' }}
            >
              <option value="">All Teachers</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>
                  {t.given_name} {t.surname}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>Loading...</div>
      ) : (
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: 'var(--space-md)', textAlign: 'left' }}>
                  {activeTab === 'mensality' ? 'Student' : 'Teacher'}
                </th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'center' }}>Due Date</th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'center' }}>Status</th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'center' }}>Payment Date</th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'mensality' ? mensalityRecords : salaryRecords).map((record) => (
                <tr key={record._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-md)' }}>
                    {activeTab === 'mensality'
                      ? (record as Mensality).student_name || 'N/A'
                      : (record as Salary).teacher_name || 'N/A'}
                  </td>
                  <td style={{ padding: 'var(--space-md)', textAlign: 'right', fontWeight: 'bold' }}>
                    {formatCurrency(record.value)}
                  </td>
                  <td style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                    {new Date(record.due_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                    <span style={{
                      padding: 'var(--space-xs) var(--space-sm)',
                      borderRadius: 'var(--radius-sm)',
                      background: record.paid ? '#10b98120' : '#ef444420',
                      color: record.paid ? '#10b981' : '#ef4444',
                      fontWeight: 'bold'
                    }}>
                      {record.paid ? '✓ Paid' : '✗ Unpaid'}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                    {record.payment_date ? new Date(record.payment_date).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                    {record.paid ? (
                      <button
                        className="btn btn--small btn--secondary"
                        onClick={() => handleMarkAsUnpaid(record._id, activeTab as 'mensality' | 'salary')}
                      >
                        Mark Unpaid
                      </button>
                    ) : (
                      <button
                        className="btn btn--small btn--primary"
                        onClick={() => handleMarkAsPaid(record._id, activeTab as 'mensality' | 'salary')}
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(activeTab === 'mensality' ? mensalityRecords : salaryRecords).length === 0 && (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--muted)' }}>
              No records found for the selected filters.
            </div>
          )}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card)',
            padding: 'var(--space-xl)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: 'var(--space-lg)' }}>
              Generate {activeTab === 'mensality' ? 'Mensality' : 'Salaries'} for {getMonthName(generateMonth)} {generateYear}
            </h3>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>Month</label>
              <select
                value={generateMonth}
                onChange={(e) => setGenerateMonth(parseInt(e.target.value))}
                style={{ width: '100%', padding: 'var(--space-sm)' }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{getMonthName(m)}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>Year</label>
              <input
                type="number"
                value={generateYear}
                onChange={(e) => setGenerateYear(parseInt(e.target.value))}
                style={{ width: '100%', padding: 'var(--space-sm)' }}
                min="2000"
                max="2100"
              />
            </div>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>Amount *</label>
              <input
                type="number"
                value={generateValue}
                onChange={(e) => setGenerateValue(e.target.value)}
                placeholder="0.00"
                step="0.01"
                style={{ width: '100%', padding: 'var(--space-sm)' }}
                required
              />
            </div>
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>Due Date *</label>
              <input
                type="date"
                value={generateDueDate}
                onChange={(e) => setGenerateDueDate(e.target.value)}
                style={{ width: '100%', padding: 'var(--space-sm)' }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
              <button
                className="btn btn--secondary"
                onClick={() => setShowGenerateModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

