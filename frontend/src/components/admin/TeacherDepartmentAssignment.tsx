import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/apiService';

interface TeacherDepartmentAssignmentProps {
  onBack: () => void;
}

interface Teacher {
  _id: string;
  given_name: string;
  surname: string;
  email_address: string;
  departments?: Department[];
}

interface Department {
  _id: string;
  department_name: string;
  department_description?: string;
}

export function TeacherDepartmentAssignment({ onBack }: TeacherDepartmentAssignmentProps) {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [savingTeacherId, setSavingTeacherId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [teachersResponse, departmentsResponse] = await Promise.all([
        apiService.get('/teacher'),
        apiService.get('/department')
      ]);

      console.log('Teachers response:', teachersResponse);
      console.log('Departments response:', departmentsResponse);

      if (teachersResponse.success) {
        // apiService wraps the response, so data contains the API response
        const teacherData = (teachersResponse.data as any)?.message || teachersResponse.data;
        setTeachers(Array.isArray(teacherData) ? teacherData : []);
      }

      if (departmentsResponse.success) {
        // apiService wraps the response, so data contains the API response
        const departmentData = (departmentsResponse.data as any)?.message || departmentsResponse.data;
        setDepartments(Array.isArray(departmentData) ? departmentData : []);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (teacher: Teacher) => {
    setEditingTeacherId(teacher._id);
    setSelectedDepartmentIds(teacher.departments?.map(d => d._id) || []);
  };

  const handleCancelEdit = () => {
    setEditingTeacherId(null);
    setSelectedDepartmentIds([]);
  };

  const handleDepartmentToggle = (departmentId: string) => {
    setSelectedDepartmentIds(prev => {
      if (prev.includes(departmentId)) {
        return prev.filter(id => id !== departmentId);
      } else {
        return [...prev, departmentId];
      }
    });
  };

  const handleSaveAssignment = async (teacherId: string) => {
    setSavingTeacherId(teacherId);
    try {
      // Get current teacher to find existing assignments
      const currentTeacher = teachers.find(t => t._id === teacherId);
      const currentDepartmentIds = currentTeacher?.departments?.map(d => d._id) || [];
      
      // Find departments to add and remove
      const departmentsToAdd = selectedDepartmentIds.filter(id => !currentDepartmentIds.includes(id));
      const departmentsToRemove = currentDepartmentIds.filter(id => !selectedDepartmentIds.includes(id));

      // Remove old assignments
      for (const departmentId of departmentsToRemove) {
        await apiService.removeTeacherFromDepartment(teacherId, departmentId);
      }

      // Add new assignments
      for (const departmentId of departmentsToAdd) {
        await apiService.assignTeacherToDepartment(teacherId, departmentId);
      }

      alert('Department assignments updated successfully!');
      setEditingTeacherId(null);
      setSelectedDepartmentIds([]);
      fetchData(); // Refresh the list
    } catch (err) {
      console.error('Error updating teacher departments:', err);
      alert('Failed to update department assignments');
    } finally {
      setSavingTeacherId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <button onClick={onBack} className="btn btn--secondary">
          {t('admin.teacherDeptAssignment.backToSetup')}
        </button>
      </div>

      <h2>{t('admin.teacherDeptAssignment.title')}</h2>
      <p className="table-description">
        {t('admin.teacherDeptAssignment.subtitle')}
      </p>

      {error && (
        <div className="error-message" style={{ marginBottom: 'var(--space-md)' }}>
          {error}
        </div>
      )}

      {teachers.length === 0 ? (
        <div className="no-data">
          <p>{t('admin.teacherDeptAssignment.noTeachers')}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Teacher Name</th>
                <th>Email</th>
                <th>Current Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>{`${teacher.given_name} ${teacher.surname}`}</td>
                  <td>{teacher.email_address}</td>
                  <td>
                    {editingTeacherId === teacher._id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        {departments.map((dept) => (
                          <label key={dept._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                            <input
                              type="checkbox"
                              checked={selectedDepartmentIds.includes(dept._id)}
                              onChange={() => handleDepartmentToggle(dept._id)}
                            />
                            <span>{dept.department_name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                        {teacher.departments && teacher.departments.length > 0 ? (
                          teacher.departments.map((dept) => (
                            <span
                              key={dept._id}
                              style={{
                                background: 'var(--primary-light)',
                                color: 'var(--primary-dark)',
                                padding: 'var(--space-xs) var(--space-sm)',
                                borderRadius: 'var(--border-radius)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: '500'
                              }}
                            >
                              {dept.department_name}
                            </span>
                          ))
                        ) : (
                          <span style={{ 
                            color: 'var(--muted)',
                            fontStyle: 'italic'
                          }}>
                            Not assigned to any departments
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingTeacherId === teacher._id ? (
                      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <button
                          onClick={() => handleSaveAssignment(teacher._id)}
                          disabled={savingTeacherId === teacher._id}
                          className="btn btn--primary btn--sm"
                        >
                          {savingTeacherId === teacher._id ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={savingTeacherId === teacher._id}
                          className="btn btn--secondary btn--sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(teacher)}
                        className="btn btn--primary btn--sm"
                      >
                        Manage Departments
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
