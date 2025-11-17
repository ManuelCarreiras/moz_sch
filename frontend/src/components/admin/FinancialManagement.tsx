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

  // Salary grid modal
  const [showSalaryGridModal, setShowSalaryGridModal] = useState(false);
  const [salaryGrid, setSalaryGrid] = useState<Array<{ teacher_id: string; teacher_name: string; email: string; base_salary: number | null; departments?: Array<{ _id: string; department_name: string }> }>>([]);
  const [editingSalaries, setEditingSalaries] = useState<Record<string, string>>({});
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [departments, setDepartments] = useState<Array<{ _id: string; department_name: string }>>([]);

  // Students and Teachers for filters/dropdowns
  const [students, setStudents] = useState<Array<{ _id: string; given_name: string; surname: string; email?: string }>>([]);
  const [teachers, setTeachers] = useState<Array<{ _id: string; given_name: string; surname: string; email_address?: string }>>([]);

  useEffect(() => {
    loadData();
    loadStudentsAndTeachers();
  }, [activeTab, filterMonth, filterYear, filterPaid, filterStudentId, filterTeacherId]);

  // Reload salary grid when department filter changes or modal opens
  useEffect(() => {
    if (showSalaryGridModal) {
      loadSalaryGrid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartmentId, showSalaryGridModal]);

  // Debug: Log when salaryGrid state changes
  useEffect(() => {
    console.log('salaryGrid state changed:', salaryGrid);
    console.log('salaryGrid length:', salaryGrid.length);
  }, [salaryGrid]);

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
    if (activeTab === 'mensality' && !generateValue) {
      alert('Please fill in all required fields');
      return;
    }
    if (!generateDueDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const generateData: any = {
        month: generateMonth,
        year: generateYear,
        due_date: generateDueDate,
      };

      // For mensality, include value. For salaries, use base_salary from teacher table
      if (activeTab === 'mensality') {
        generateData.value = parseFloat(generateValue);
      }

      const response = activeTab === 'mensality'
        ? await apiService.generateMensality(generateData)
        : await apiService.generateTeacherSalary(generateData);

      if (response.success) {
        const data = response.data as any;
        let message = `Successfully generated ${data.created || 0} records`;
        if (data.skipped_no_base_salary && data.skipped_no_base_salary.length > 0) {
          message += `\n\nNote: ${data.skipped_no_base_salary.length} teacher(s) skipped (no base salary set): ${data.skipped_no_base_salary.join(', ')}`;
        }
        alert(message);
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

  const loadDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      if (response.success && response.data) {
        const deptData = (response.data as any)?.message || response.data;
        const deptArray = Array.isArray(deptData) ? deptData : [];
        setDepartments(deptArray);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadSalaryGrid = async () => {
    try {
      const response = await apiService.getTeacherSalaryGrid(selectedDepartmentId || undefined);
      console.log('Salary grid response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      if (response.success && response.data) {
        const grid = (response.data as any).salary_grid || [];
        console.log('Parsed salary grid:', grid);
        console.log('Grid length:', grid.length);
        setSalaryGrid(grid);
        // Initialize editing state
        const editing: Record<string, string> = {};
        grid.forEach((item: any) => {
          editing[item.teacher_id] = item.base_salary?.toString() || '';
        });
        setEditingSalaries(editing);
        console.log('State updated - salaryGrid set to:', grid);
      } else {
        console.warn('Salary grid response not successful:', response);
      }
    } catch (error) {
      console.error('Error loading salary grid:', error);
    }
  };

  const handleSaveSalaryGrid = async () => {
    try {
      setLoading(true);
      const salaries = salaryGrid.map(item => ({
        teacher_id: item.teacher_id,
        base_salary: editingSalaries[item.teacher_id] ? parseFloat(editingSalaries[item.teacher_id]) : null
      }));

      const response = await apiService.updateTeacherSalaryGrid(salaries);
      if (response.success) {
        alert(`Successfully updated ${(response.data as any).updated || 0} teacher salaries`);
        setShowSalaryGridModal(false);
        loadSalaryGrid();
      } else {
        alert(response.error || 'Failed to update salaries');
      }
    } catch (error) {
      console.error('Error saving salary grid:', error);
      alert('Error saving salary grid');
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
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {activeTab === 'salary' && (
            <button
              className="btn btn--secondary"
              onClick={() => {
                setShowSalaryGridModal(true);
                setSelectedDepartmentId('');
                loadDepartments();
                loadSalaryGrid();
              }}
            >
              Manage Salary Grid
            </button>
          )}
          <button
            className="btn btn--primary"
            onClick={() => setShowGenerateModal(true)}
          >
            Generate {activeTab === 'mensality' ? 'Mensality' : 'Salaries'} for Month
          </button>
        </div>
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
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
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
            {activeTab === 'mensality' && (
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
            )}
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

      {/* Salary Grid Modal */}
      {showSalaryGridModal && (
        <>
          <style>{`
            .salary-grid-scrollable::-webkit-scrollbar {
              width: 12px;
            }
            .salary-grid-scrollable::-webkit-scrollbar-track {
              background: var(--surface);
              border-radius: 6px;
            }
            .salary-grid-scrollable::-webkit-scrollbar-thumb {
              background: var(--muted);
              border-radius: 6px;
              border: 2px solid var(--surface);
            }
            .salary-grid-scrollable::-webkit-scrollbar-thumb:hover {
              background: var(--text);
            }
          `}</style>
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
          <div 
            className="salary-grid-scrollable"
            style={{
              background: 'var(--card)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '900px',
              width: '90%',
              maxHeight: '85vh',
              overflowY: 'scroll',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header section */}
            <div style={{ padding: 'var(--space-xl)', paddingBottom: 'var(--space-md)' }}>
              <h3 style={{ marginBottom: 'var(--space-md)' }}>
                Manage Teacher Salary Grid
              </h3>
              <p style={{ marginBottom: 'var(--space-md)', color: 'var(--muted)' }}>
                Set the base monthly salary for each teacher. These values will be used when generating monthly salary records.
              </p>
              
              {/* Department Filter */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>Filter by Department</label>
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => {
                    setSelectedDepartmentId(e.target.value);
                  }}
                  style={{ width: '100%', padding: 'var(--space-sm)', maxWidth: '300px' }}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>{dept.department_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table area */}
            <div style={{ 
              paddingLeft: 'var(--space-xl)',
              paddingRight: 'var(--space-xl)',
              paddingBottom: 'var(--space-md)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', width: '30%' }}>Teacher</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', width: '35%' }}>Email</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'right', width: '35%' }}>Base Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    console.log('Rendering table - salaryGrid state:', salaryGrid);
                    console.log('salaryGrid.length:', salaryGrid.length);
                    return salaryGrid.length > 0 ? (
                      salaryGrid.map((item) => (
                      <tr key={item.teacher_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: 'var(--space-md)', wordWrap: 'break-word' }}>
                          {item.teacher_name}
                          {item.departments && item.departments.length > 0 && (
                            <div style={{ fontSize: '0.85em', color: 'var(--muted)', marginTop: 'var(--space-xs)' }}>
                              {item.departments.map(d => d.department_name).join(', ')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: 'var(--space-md)', color: 'var(--muted)', wordWrap: 'break-word' }}>{item.email}</td>
                        <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={editingSalaries[item.teacher_id] || ''}
                            onChange={(e) => setEditingSalaries({
                              ...editingSalaries,
                              [item.teacher_id]: e.target.value
                            })}
                            placeholder="0.00"
                            step="0.01"
                            style={{ width: '100%', maxWidth: '200px', padding: 'var(--space-xs)', textAlign: 'right' }}
                          />
                        </td>
                      </tr>
                    ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--muted)' }}>
                          No teachers found{selectedDepartmentId ? ' in this department' : ''}. (Debug: salaryGrid.length = {salaryGrid.length})
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
            
            {/* Footer section */}
            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-md)', 
              justifyContent: 'flex-end', 
              padding: 'var(--space-xl)',
              paddingTop: 'var(--space-md)',
              borderTop: '1px solid var(--border)'
            }}>
              <button
                className="btn btn--secondary"
                onClick={() => setShowSalaryGridModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                onClick={handleSaveSalaryGrid}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

