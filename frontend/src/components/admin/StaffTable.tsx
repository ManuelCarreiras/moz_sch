import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/apiService';
import { StaffWizard } from './StaffWizard';

export interface Staff {
  _id: string;
  given_name: string;
  surname: string;
  email_address: string;
  phone_number: string;
  gender: string;
  role: string;
  hire_date?: string | null;
  base_salary?: number | null;
  username?: string;
}

export function StaffTable() {
  const { t } = useTranslation();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>(''); // 'financial', 'secretary', or '' for all

  useEffect(() => {
    loadStaff();
  }, [roleFilter]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getStaff(roleFilter || undefined);
      
      if (response.success && response.data) {
        const staffData = (response.data as any).message || response.data;
        setStaff(Array.isArray(staffData) ? staffData : []);
      } else {
        setError(response.error || t('admin.staff.failedLoad'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error loading staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffCreated = () => {
    loadStaff(); // Reload the staff list
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm(t('admin.staff.confirmDelete'))) {
      return;
    }

    try {
      const response = await apiService.deleteStaff(id);
      if (response.success) {
        await loadStaff(); // Reload the list
      } else {
        setError(response.error || t('admin.staff.failedDelete'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error deleting staff:', err);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return t('admin.staff.notSet');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t('common.na');
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: 'var(--text-lg)',
        color: 'var(--muted)'
      }}>
        {t('admin.staff.loadingStaff')}
      </div>
    );
  }

  return (
    <div className="staff-table">
      <div className="table-header">
        <div className="table-header__title">
          <h2>{t('admin.staff.title')}</h2>
          <p>{t('admin.staff.subtitle')}</p>
        </div>
        <div className="table-header__actions">
          <button 
            className="btn btn--primary"
            onClick={() => setShowCreateStaff(true)}
          >
            ➕ {t('admin.staff.addNew')}
          </button>
        </div>
      </div>

      {/* Role Filter */}
      <div style={{ 
        marginBottom: 'var(--space-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)'
      }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>
          {t('admin.staff.filterByRole')}
        </label>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="role-filter-select"
          style={{
            padding: 'var(--space-sm)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
            color: 'var(--text)',
            fontSize: 'var(--text-base)',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          <option value="" style={{ backgroundColor: 'var(--card)', color: 'var(--text)' }}>{t('common.allRoles')}</option>
          <option value="financial" style={{ backgroundColor: 'var(--card)', color: 'var(--text)' }}>{t('common.financial')}</option>
          <option value="secretary" style={{ backgroundColor: 'var(--card)', color: 'var(--text)' }}>{t('common.secretary')}</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('common.name')}</th>
              <th>{t('common.email')}</th>
              <th>{t('common.phone')}</th>
              <th>{t('common.gender')}</th>
              <th>{t('common.role')}</th>
              <th>{t('common.hireDate')}</th>
              <th>{t('admin.staff.baseSalary')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  {t('admin.staff.noStaff')}
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member._id}>
                  <td>
                    <div className="staff-name">
                      <strong>{member.given_name} {member.surname}</strong>
                    </div>
                  </td>
                  <td>{member.email_address}</td>
                  <td>{member.phone_number}</td>
                  <td>
                    <span className="staff-gender">
                      {member.gender === 'Male' ? '♂' : member.gender === 'Female' ? '♀' : '⚧'}
                    </span>
                    {member.gender}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius)',
                      backgroundColor: member.role === 'financial' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(0, 122, 255, 0.2)',
                      color: member.role === 'financial' ? '#34c759' : '#007aff',
                      fontSize: 'var(--text-sm)',
                      textTransform: 'capitalize'
                    }}>
                      {member.role}
                    </span>
                  </td>
                  <td>{formatDate(member.hire_date)}</td>
                  <td>{formatCurrency(member.base_salary)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn--small btn--secondary">{t('common.edit')}</button>
                      <button 
                        className="btn btn--small btn--danger"
                        onClick={() => handleDeleteStaff(member._id)}
                        title={t('admin.staff.deleteStaff')}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Staff Modal */}
      {showCreateStaff && (
        <StaffWizard
          onClose={() => setShowCreateStaff(false)}
          onSuccess={() => {
            handleStaffCreated();
            setShowCreateStaff(false);
          }}
        />
      )}
    </div>
  );
}
