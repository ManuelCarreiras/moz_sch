import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/apiService';

export interface Classroom {
  _id: string;
  room_type: string;
  room_name: string;
  capacity: number;
  room_type_name?: string;
}

export interface ClassroomType {
  _id: string;
  name: string;
}

interface ClassroomManagementProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

type ManagementTab = 'types' | 'classrooms';

export function ClassroomManagement({ onSuccess, onBack }: ClassroomManagementProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ManagementTab>('types');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classroomTypes, setClassroomTypes] = useState<ClassroomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Classroom Type form state
  const [newTypeName, setNewTypeName] = useState('');
  const [isCreatingType, setIsCreatingType] = useState(false);

  // Classroom form state
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [newCapacity, setNewCapacity] = useState<number>(1);
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchClassrooms(),
        fetchClassroomTypes()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const response = await apiService.getClassrooms();
      if (response.success) {
        const classroomData = (response.data as any).message || response.data;
        setClassrooms(Array.isArray(classroomData) ? classroomData : []);
      }
    } catch (err) {
      console.error('Error fetching classrooms:', err);
    }
  };

  const fetchClassroomTypes = async () => {
    try {
      const response = await apiService.getClassroomTypes();
      if (response.success) {
        const classroomTypeData = (response.data as any).message || response.data;
        setClassroomTypes(Array.isArray(classroomTypeData) ? classroomTypeData : []);
      }
    } catch (err) {
      console.error('Error fetching classroom types:', err);
    }
  };

  // Classroom Type handlers
  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    setIsCreatingType(true);
    setError(null);

    try {
      const response = await apiService.createClassroomType({
        name: newTypeName.trim()
      });

      if (response.success) {
        alert(t('admin.classrooms.typeCreateSuccess'));
        setNewTypeName('');
        fetchClassroomTypes();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || t('admin.classrooms.typeFailedCreate'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error creating classroom type:', err);
    } finally {
      setIsCreatingType(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!window.confirm(t('admin.classrooms.typeConfirmDelete'))) {
      return;
    }

    try {
      const response = await apiService.deleteClassroomType(id);
      
      if (response.success) {
        alert(t('admin.classrooms.typeDeleteSuccess'));
        fetchClassroomTypes();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || t('admin.classrooms.typeFailedDelete'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error deleting classroom type:', err);
    }
  };

  // Classroom handlers
  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !selectedRoomTypeId || newCapacity < 1) return;

    setIsCreatingClassroom(true);
    setError(null);

    try {
      const response = await apiService.createClassroom({
        room_name: newRoomName.trim(),
        room_type: selectedRoomTypeId,
        capacity: newCapacity
      });

      if (response.success) {
        alert(t('admin.classrooms.classroomCreateSuccess'));
        setNewRoomName('');
        setSelectedRoomTypeId('');
        setNewCapacity(1);
        fetchClassrooms();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || t('admin.classrooms.classroomFailedCreate'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error creating classroom:', err);
    } finally {
      setIsCreatingClassroom(false);
    }
  };

  const handleDeleteClassroom = async (id: string) => {
    if (!window.confirm(t('admin.classrooms.classroomConfirmDelete'))) {
      return;
    }

    try {
      const response = await apiService.deleteClassroom(id);
      
      if (response.success) {
        alert(t('admin.classrooms.classroomDeleteSuccess'));
        fetchClassrooms();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || t('admin.classrooms.classroomFailedDelete'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error deleting classroom:', err);
    }
  };

  if (loading) {
    return <div className="loading">{t('admin.classrooms.loadingData')}</div>;
  }

  return (
    <div className="classroom-management">
      <div className="table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          {onBack && (
            <button 
              className="btn btn--secondary"
              onClick={onBack}
            >
              {t('admin.classrooms.backToSetup')}
            </button>
          )}
          <div>
            <h3>{t('admin.classrooms.title')}</h3>
            <p className="table-description">{t('admin.classrooms.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        <button
          className={`btn ${activeTab === 'types' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setActiveTab('types')}
        >
          {t('admin.classrooms.typesTab')}
        </button>
        <button
          className={`btn ${activeTab === 'classrooms' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setActiveTab('classrooms')}
        >
          {t('admin.classrooms.classroomsTab')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Classroom Types Tab */}
      {activeTab === 'types' && (
        <div>
          <div className="form-section">
            <h4>{t('admin.classrooms.addNewType')}</h4>
            <form onSubmit={handleCreateType} className="form-inline">
              <div className="form-group">
                <label htmlFor="typeName">{t('admin.classrooms.typeNameLabel')}</label>
                <input
                  type="text"
                  id="typeName"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  required
                  placeholder={t('admin.classrooms.typeNamePlaceholder')}
                  disabled={isCreatingType}
                />
              </div>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isCreatingType || !newTypeName.trim()}
              >
                {isCreatingType ? t('common.adding') : t('admin.classrooms.addType')}
              </button>
            </form>
          </div>

          <div className="table-container">
            <h4>{t('admin.classrooms.existingTypes')}</h4>
            {classroomTypes.length === 0 ? (
              <p className="no-data">{t('admin.classrooms.noTypes')}</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('admin.classrooms.typeName')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {classroomTypes.map((type) => (
                    <tr key={type._id}>
                      <td>{type.name}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteType(type._id)}
                          className="btn btn--danger btn--small"
                        >
                          {t('common.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Classrooms Tab */}
      {activeTab === 'classrooms' && (
        <div>
          <div className="form-section">
            <h4>{t('admin.classrooms.addNewClassroom')}</h4>
            <form onSubmit={handleCreateClassroom} className="form-inline">
              <div className="form-group">
                <label htmlFor="roomName">{t('admin.classrooms.roomNameLabel')}</label>
                <input
                  type="text"
                  id="roomName"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  required
                  placeholder={t('admin.classrooms.roomNamePlaceholder')}
                  disabled={isCreatingClassroom}
                />
              </div>
              <div className="form-group">
                <label htmlFor="roomType">{t('admin.classrooms.roomTypeLabel')}</label>
                <select
                  id="roomType"
                  value={selectedRoomTypeId}
                  onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                  required
                  disabled={isCreatingClassroom}
                >
                  <option value="">{t('admin.classrooms.selectRoomType')}</option>
                  {classroomTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="capacity">{t('admin.classrooms.capacityLabel')}</label>
                <input
                  type="number"
                  id="capacity"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(parseInt(e.target.value) || 1)}
                  required
                  min="1"
                  disabled={isCreatingClassroom}
                />
              </div>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isCreatingClassroom || !newRoomName.trim() || !selectedRoomTypeId || newCapacity < 1}
              >
                {isCreatingClassroom ? t('common.adding') : t('admin.classrooms.addClassroom')}
              </button>
            </form>
          </div>

          <div className="table-container">
            <h4>{t('admin.classrooms.existingClassrooms')}</h4>
            {classrooms.length === 0 ? (
              <p className="no-data">{t('admin.classrooms.noClassrooms')}</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('admin.classrooms.roomName')}</th>
                    <th>{t('admin.classrooms.roomType')}</th>
                    <th>{t('common.capacity')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {classrooms.map((classroom) => (
                    <tr key={classroom._id}>
                      <td>{classroom.room_name}</td>
                      <td>{classroom.room_type_name || t('common.unknown')}</td>
                      <td>{classroom.capacity}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteClassroom(classroom._id)}
                          className="btn btn--danger btn--small"
                        >
                          {t('common.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
