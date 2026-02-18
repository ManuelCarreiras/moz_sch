import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

interface StaffSalary {
  _id: string;
  staff_id: string;
  staff_name?: string;
  staff_email?: string;
  staff_role?: string;
  value: number;
  paid: boolean;
  due_date: string;
  month: number;
  year: number;
  payment_date?: string | null;
  notes?: string;
}

type FinancialTab = 'mensality' | 'salary' | 'staff-salary';

export function FinancialManagement() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FinancialTab>('mensality');
  const [loading, setLoading] = useState(false);
  const [mensalityRecords, setMensalityRecords] = useState<Mensality[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<Salary[]>([]);
  const [staffSalaryRecords, setStaffSalaryRecords] = useState<StaffSalary[]>([]);
  
  // Filters
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterPaid, setFilterPaid] = useState<string>('all'); // 'all', 'paid', 'unpaid'
  const [filterStudentId, setFilterStudentId] = useState<string>('');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('');
  const [filterStaffId, setFilterStaffId] = useState<string>('');

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

  // Staff salary grid modal
  const [showStaffSalaryGridModal, setShowStaffSalaryGridModal] = useState(false);
  const [staffSalaryGrid, setStaffSalaryGrid] = useState<Array<{ staff_id: string; staff_name: string; email: string; role: string; base_salary: number | null }>>([]);
  const [editingStaffSalaries, setEditingStaffSalaries] = useState<Record<string, string>>({});
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('');

  // Students, Teachers, and Staff for filters/dropdowns
  const [students, setStudents] = useState<Array<{ _id: string; given_name: string; surname: string; email?: string }>>([]);
  const [teachers, setTeachers] = useState<Array<{ _id: string; given_name: string; surname: string; email_address?: string }>>([]);
  const [staff, setStaff] = useState<Array<{ _id: string; given_name: string; surname: string; email_address?: string; role: string }>>([]);

  useEffect(() => {
    loadData();
    loadStudentsAndTeachers();
  }, [activeTab, filterMonth, filterYear, filterPaid, filterStudentId, filterTeacherId, filterStaffId]);

  // Reload salary grid when department filter changes or modal opens
  useEffect(() => {
    if (showSalaryGridModal) {
      loadSalaryGrid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartmentId, showSalaryGridModal]);

  // Reload staff salary grid when role filter changes or modal opens
  useEffect(() => {
    if (showStaffSalaryGridModal) {
      loadStaffSalaryGrid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleFilter, showStaffSalaryGridModal]);

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
      } else if (activeTab === 'salary') {
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
      } else if (activeTab === 'staff-salary') {
        const filters: any = {
          month: filterMonth,
          year: filterYear,
        };
        if (filterStaffId) filters.staff_id = filterStaffId;
        if (filterPaid !== 'all') filters.paid = filterPaid === 'paid';
        
        const response = await apiService.getStaffSalary(filters);
        if (response.success && response.data) {
          const records = (response.data as any).salary_records || [];
          setStaffSalaryRecords(records);
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
      const [studentsRes, teachersRes, staffRes] = await Promise.all([
        apiService.getStudents(),
        apiService.getTeachers(),
        apiService.getStaff(),
      ]);
      if (studentsRes.success && studentsRes.data) {
        const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        setStudents(studentsData.filter((s: any) => s.is_active !== false));
      }
      if (teachersRes.success && teachersRes.data) {
        const teachersData = Array.isArray(teachersRes.data) ? teachersRes.data : [];
        setTeachers(teachersData);
      }
      if (staffRes.success && staffRes.data) {
        const staffData = (staffRes.data as any).message || staffRes.data;
        setStaff(Array.isArray(staffData) ? staffData : []);
      }
    } catch (error) {
      console.error('Error loading students/teachers/staff:', error);
    }
  };

  const handleMarkAsPaid = async (id: string, type: 'mensality' | 'salary' | 'staff-salary') => {
    try {
      const updateData = {
        _id: id,
        paid: true,
        payment_date: new Date().toISOString().split('T')[0],
      };
      
      let response;
      if (type === 'mensality') {
        response = await apiService.updateMensality(updateData);
      } else if (type === 'salary') {
        response = await apiService.updateTeacherSalary(updateData);
      } else {
        response = await apiService.updateStaffSalary(updateData);
      }
      
      if (response.success) {
        loadData();
      } else {
        alert(response.error || t('admin.financial.failedUpdatePayment'));
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert(t('admin.financial.errorUpdatePayment'));
    }
  };

  const handleMarkAsUnpaid = async (id: string, type: 'mensality' | 'salary' | 'staff-salary') => {
    try {
      const updateData = {
        _id: id,
        paid: false,
        payment_date: null,
      };
      
      let response;
      if (type === 'mensality') {
        response = await apiService.updateMensality(updateData);
      } else if (type === 'salary') {
        response = await apiService.updateTeacherSalary(updateData);
      } else {
        response = await apiService.updateStaffSalary(updateData);
      }
      
      if (response.success) {
        loadData();
      } else {
        alert(response.error || t('admin.financial.failedUpdatePayment'));
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert(t('admin.financial.errorUpdatePayment'));
    }
  };

  const handleGenerate = async () => {
    if (activeTab === 'mensality' && !generateValue) {
      alert(t('common.fillRequiredFields'));
      return;
    }
    if (!generateDueDate) {
      alert(t('common.fillRequiredFields'));
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

      let response;
      if (activeTab === 'mensality') {
        response = await apiService.generateMensality(generateData);
      } else if (activeTab === 'salary') {
        response = await apiService.generateTeacherSalary(generateData);
      } else {
        response = await apiService.generateStaffSalary(generateData);
      }

      if (response.success) {
        const data = response.data as any;
        let message = t('admin.financial.generateSuccess', { count: data.created || 0 });
        if (data.skipped_no_base_salary && data.skipped_no_base_salary.length > 0) {
          message += `\n\nNote: ${data.skipped_no_base_salary.length} teacher(s) skipped (no base salary set): ${data.skipped_no_base_salary.join(', ')}`;
        }
        alert(message);
        setShowGenerateModal(false);
        setGenerateValue('');
        loadData();
      } else {
        alert(response.error || t('admin.financial.failedGenerate'));
      }
    } catch (error) {
      console.error('Error generating records:', error);
      alert(t('admin.financial.failedGenerate'));
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

  const loadStaffSalaryGrid = async () => {
    try {
      const response = await apiService.getStaffSalaryGrid(selectedRoleFilter || undefined);
      if (response.success && response.data) {
        const grid = (response.data as any).salary_grid || [];
        setStaffSalaryGrid(grid);
        // Initialize editing state
        const editing: Record<string, string> = {};
        grid.forEach((item: any) => {
          editing[item.staff_id] = item.base_salary?.toString() || '';
        });
        setEditingStaffSalaries(editing);
      }
    } catch (error) {
      console.error('Error loading staff salary grid:', error);
    }
  };

  const handleSaveStaffSalaryGrid = async () => {
    try {
      setLoading(true);
      const salaries = staffSalaryGrid.map(item => ({
        staff_id: item.staff_id,
        base_salary: editingStaffSalaries[item.staff_id] ? parseFloat(editingStaffSalaries[item.staff_id]) : null
      }));

      const response = await apiService.updateStaffSalaryGrid(salaries);
      if (response.success) {
        alert(t('admin.financial.staffSalarySuccess', { count: (response.data as any).updated || 0 }));
        setShowStaffSalaryGridModal(false);
        loadStaffSalaryGrid();
      } else {
        alert(response.error || t('admin.financial.failedUpdateSalaries'));
      }
    } catch (error) {
      console.error('Error saving staff salary grid:', error);
      alert(t('admin.financial.failedUpdateSalaries'));
    } finally {
      setLoading(false);
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
        alert(t('admin.financial.teacherSalarySuccess', { count: (response.data as any).updated || 0 }));
        setShowSalaryGridModal(false);
        loadSalaryGrid();
      } else {
        alert(response.error || t('admin.financial.failedUpdateSalaries'));
      }
    } catch (error) {
      console.error('Error saving salary grid:', error);
      alert(t('admin.financial.failedUpdateSalaries'));
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
    const monthKeys = ['', 'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'];
    return t(`admin.financial.${monthKeys[month]}`) || month.toString();
  };

  const getCurrentRecords = () => {
    if (activeTab === 'mensality') return mensalityRecords;
    if (activeTab === 'salary') return salaryRecords;
    return staffSalaryRecords;
  };

  const currentRecords = getCurrentRecords();
  const totalPaid = currentRecords.filter((r: any) => r.paid).reduce((sum: number, r: any) => sum + r.value, 0);
  const totalUnpaid = currentRecords.filter((r: any) => !r.paid).reduce((sum: number, r: any) => sum + r.value, 0);
  const totalRecords = currentRecords.length;

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h2>{t('admin.financial.title')}</h2>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {(activeTab === 'salary' || activeTab === 'staff-salary') && (
            <button
              className="btn btn--secondary"
              onClick={() => {
                if (activeTab === 'salary') {
                  setShowSalaryGridModal(true);
                  setSelectedDepartmentId('');
                  loadDepartments();
                  loadSalaryGrid();
                } else {
                  setShowStaffSalaryGridModal(true);
                  setSelectedRoleFilter('');
                  loadStaffSalaryGrid();
                }
              }}
            >
              {t('admin.financial.manageSalaryGrid')}
            </button>
          )}
          <button
            className="btn btn--primary"
            onClick={() => setShowGenerateModal(true)}
          >
            {activeTab === 'mensality' ? t('admin.financial.generateMensalityForMonth') : t('admin.financial.generateSalariesForMonth')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        <button
          className={`btn ${activeTab === 'mensality' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setActiveTab('mensality')}
        >
          📚 {t('admin.financial.studentMensality')}
        </button>
        <button
          className={`btn ${activeTab === 'salary' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setActiveTab('salary')}
        >
          💰 {t('admin.financial.teacherSalaries')}
        </button>
        <button
          className={`btn ${activeTab === 'staff-salary' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setActiveTab('staff-salary')}
        >
          👔 {t('admin.financial.staffSalaries')}
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
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{t('admin.financial.totalRecords')}</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}>{totalRecords}</div>
        </div>
        <div style={{ padding: 'var(--space-md)', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{t('admin.financial.totalPaid')}</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#10b981' }}>
            {formatCurrency(totalPaid)}
          </div>
        </div>
        <div style={{ padding: 'var(--space-md)', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{t('admin.financial.totalUnpaid')}</div>
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
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>{t('common.month')}</label>
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
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>{t('common.year')}</label>
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
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>{t('admin.financial.paymentStatus')}</label>
          <select
            value={filterPaid}
            onChange={(e) => setFilterPaid(e.target.value)}
            style={{ width: '100%', padding: 'var(--space-sm)' }}
          >
            <option value="all">{t('common.all')}</option>
            <option value="paid">{t('admin.financial.paid')}</option>
            <option value="unpaid">{t('admin.financial.unpaid')}</option>
          </select>
        </div>
        {activeTab === 'mensality' ? (
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>{t('common.student')}</label>
            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              style={{ width: '100%', padding: 'var(--space-sm)' }}
            >
              <option value="">{t('common.allStudents')}</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>
                  {s.given_name} {s.surname}
                </option>
              ))}
            </select>
          </div>
        ) : activeTab === 'salary' ? (
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>{t('common.teacher')}</label>
            <select
              value={filterTeacherId}
              onChange={(e) => setFilterTeacherId(e.target.value)}
              style={{ width: '100%', padding: 'var(--space-sm)' }}
            >
              <option value="">{t('common.allTeachers')}</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>
                  {t.given_name} {t.surname}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>{t('admin.financial.staffLabel')}</label>
            <select
              value={filterStaffId}
              onChange={(e) => setFilterStaffId(e.target.value)}
              style={{ width: '100%', padding: 'var(--space-sm)' }}
            >
              <option value="">{t('common.allStaff')}</option>
              {staff.map(s => (
                <option key={s._id} value={s._id}>
                  {s.given_name} {s.surname} ({s.role})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>{t('common.loading')}</div>
      ) : (
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: 'var(--space-md)', textAlign: 'left' }}>
                  {activeTab === 'mensality' ? t('common.student') : activeTab === 'salary' ? t('common.teacher') : t('admin.financial.staffLabel')}
                </th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'right' }}>{t('admin.financial.amount')}</th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'center' }}>{t('admin.financial.dueDate')}</th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'center' }}>{t('admin.financial.status')}</th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'center' }}>{t('admin.financial.paymentDate')}</th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'center' }}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record: any) => (
                <tr key={record._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-md)' }}>
                    {activeTab === 'mensality'
                      ? (record as Mensality).student_name || t('common.na')
                      : activeTab === 'salary'
                      ? (record as Salary).teacher_name || t('common.na')
                      : (record as StaffSalary).staff_name || t('common.na')}
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
                      {record.paid ? t('admin.financial.statusPaid') : t('admin.financial.statusUnpaid')}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                    {record.payment_date ? new Date(record.payment_date).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                    {record.paid ? (
                      <button
                        className="btn btn--small btn--secondary"
                        onClick={() => handleMarkAsUnpaid(record._id, activeTab as 'mensality' | 'salary' | 'staff-salary')}
                      >
                        {t('admin.financial.markUnpaid')}
                      </button>
                    ) : (
                      <button
                        className="btn btn--small btn--primary"
                        onClick={() => handleMarkAsPaid(record._id, activeTab as 'mensality' | 'salary' | 'staff-salary')}
                      >
                        {t('admin.financial.markPaid')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentRecords.length === 0 && (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--muted)' }}>
              {t('admin.financial.noRecords')}
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
              {t('admin.financial.generateFor', {
                type: activeTab === 'mensality' ? t('admin.financial.mensalityType') : t('admin.financial.salariesType'),
                month: getMonthName(generateMonth),
                year: generateYear
              })}
            </h3>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>{t('common.month')}</label>
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
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>{t('common.year')}</label>
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
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>{t('admin.financial.amountLabel')}</label>
                <input
                  type="number"
                  value={generateValue}
                  onChange={(e) => setGenerateValue(e.target.value)}
                  placeholder={t('admin.financial.amountPlaceholder')}
                  step="0.01"
                  style={{ width: '100%', padding: 'var(--space-sm)' }}
                  required
                />
              </div>
            )}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>{t('admin.financial.dueDateLabel')}</label>
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
                {t('common.cancel')}
              </button>
              <button
                className="btn btn--primary"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? t('admin.financial.generating') : t('admin.financial.generate')}
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
                {t('admin.financial.manageSalaryGridTeacher')}
              </h3>
              <p style={{ marginBottom: 'var(--space-md)', color: 'var(--muted)' }}>
                {t('admin.financial.manageSalaryGridTeacherDesc')}
              </p>
              
              {/* Department Filter */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>{t('admin.financial.filterByDepartment')}</label>
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => {
                    setSelectedDepartmentId(e.target.value);
                  }}
                  style={{ width: '100%', padding: 'var(--space-sm)', maxWidth: '300px' }}
                >
                  <option value="">{t('common.allDepartments')}</option>
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
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', width: '30%' }}>{t('common.teacher')}</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', width: '35%' }}>{t('common.email')}</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'right', width: '35%' }}>{t('admin.financial.baseSalary')}</th>
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
                          {selectedDepartmentId ? t('admin.financial.noTeachersInDept') : t('admin.financial.noTeachers')}
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
                {t('common.cancel')}
              </button>
              <button
                className="btn btn--primary"
                onClick={handleSaveSalaryGrid}
                disabled={loading}
              >
                {loading ? t('admin.financial.saving') : t('admin.financial.saveChanges')}
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Staff Salary Grid Modal */}
      {showStaffSalaryGridModal && (
        <>
          <style>{`
            .staff-salary-grid-scrollable::-webkit-scrollbar {
              width: 12px;
            }
            .staff-salary-grid-scrollable::-webkit-scrollbar-track {
              background: var(--surface);
              border-radius: 6px;
            }
            .staff-salary-grid-scrollable::-webkit-scrollbar-thumb {
              background: var(--muted);
              border-radius: 6px;
              border: 2px solid var(--surface);
            }
            .staff-salary-grid-scrollable::-webkit-scrollbar-thumb:hover {
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
            className="staff-salary-grid-scrollable"
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
                {t('admin.financial.manageSalaryGridStaff')}
              </h3>
              <p style={{ marginBottom: 'var(--space-md)', color: 'var(--muted)' }}>
                {t('admin.financial.manageSalaryGridStaffDesc')}
              </p>
              
              {/* Role Filter */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>{t('admin.financial.filterByRole')}</label>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => {
                    setSelectedRoleFilter(e.target.value);
                  }}
                  style={{ width: '100%', padding: 'var(--space-sm)', maxWidth: '300px' }}
                >
                  <option value="">{t('admin.financial.allRolesOption')}</option>
                  <option value="financial">{t('admin.financial.roleFinancial')}</option>
                  <option value="secretary">{t('admin.financial.roleSecretary')}</option>
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
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', width: '25%' }}>{t('admin.financial.staffLabel')}</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', width: '25%' }}>{t('common.email')}</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', width: '20%' }}>{t('common.role')}</th>
                    <th style={{ padding: 'var(--space-md)', textAlign: 'right', width: '30%' }}>{t('admin.financial.baseSalary')}</th>
                  </tr>
                </thead>
                <tbody>
                  {staffSalaryGrid.length > 0 ? (
                    staffSalaryGrid.map((item) => (
                      <tr key={item.staff_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: 'var(--space-md)', wordWrap: 'break-word' }}>
                          {item.staff_name}
                        </td>
                        <td style={{ padding: 'var(--space-md)', color: 'var(--muted)', wordWrap: 'break-word' }}>{item.email}</td>
                        <td style={{ padding: 'var(--space-md)', textTransform: 'capitalize' }}>{item.role}</td>
                        <td style={{ padding: 'var(--space-md)', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={editingStaffSalaries[item.staff_id] || ''}
                            onChange={(e) => setEditingStaffSalaries({
                              ...editingStaffSalaries,
                              [item.staff_id]: e.target.value
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
                      <td colSpan={4} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--muted)' }}>
                        {selectedRoleFilter ? t('admin.financial.noStaffInRole') : t('admin.financial.noStaff')}
                      </td>
                    </tr>
                  )}
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
                onClick={() => setShowStaffSalaryGridModal(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn--primary"
                onClick={handleSaveStaffSalaryGrid}
                disabled={loading}
              >
                {loading ? t('admin.financial.saving') : t('admin.financial.saveChanges')}
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

