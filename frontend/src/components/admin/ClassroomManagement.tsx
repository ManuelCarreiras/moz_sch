import React, { useState, useEffect } from 'react';
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
        alert('Classroom type created successfully!');
        setNewTypeName('');
        fetchClassroomTypes();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Failed to create classroom type');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating classroom type:', err);
    } finally {
      setIsCreatingType(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this classroom type?')) {
      return;
    }

    try {
      const response = await apiService.deleteClassroomType(id);
      
      if (response.success) {
        alert('Classroom type deleted successfully!');
        fetchClassroomTypes();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Failed to delete classroom type');
      }
    } catch (err) {
      setError('Network error occurred');
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
        alert('Classroom created successfully!');
        setNewRoomName('');
        setSelectedRoomTypeId('');
        setNewCapacity(1);
        fetchClassrooms();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Failed to create classroom');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating classroom:', err);
    } finally {
      setIsCreatingClassroom(false);
    }
  };

  const handleDeleteClassroom = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this classroom?')) {
      return;
    }

    try {
      const response = await apiService.deleteClassroom(id);
      
      if (response.success) {
        alert('Classroom deleted successfully!');
        fetchClassrooms();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Failed to delete classroom');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error deleting classroom:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading classroom data...</div>;
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
              ← Back to Academic Setup
            </button>
          )}
          <div>
            <h3>Classroom Management</h3>
            <p className="table-description">Manage classroom types and physical classroom spaces.</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        <button
          className={`btn ${activeTab === 'types' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setActiveTab('types')}
        >
          Classroom Types
        </button>
        <button
          className={`btn ${activeTab === 'classrooms' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setActiveTab('classrooms')}
        >
          Classrooms
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
            <h4>Add New Classroom Type</h4>
            <form onSubmit={handleCreateType} className="form-inline">
              <div className="form-group">
                <label htmlFor="typeName">Classroom Type Name *</label>
                <input
                  type="text"
                  id="typeName"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  required
                  placeholder="e.g., Lab, Lecture Hall, Computer Room, Library"
                  disabled={isCreatingType}
                />
              </div>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isCreatingType || !newTypeName.trim()}
              >
                {isCreatingType ? 'Adding...' : 'Add Classroom Type'}
              </button>
            </form>
          </div>

          <div className="table-container">
            <h4>Existing Classroom Types</h4>
            {classroomTypes.length === 0 ? (
              <p className="no-data">No classroom types found. Add one above!</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type Name</th>
                    <th>Actions</th>
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
                          Delete
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
            <h4>Add New Classroom</h4>
            <form onSubmit={handleCreateClassroom} className="form-inline">
              <div className="form-group">
                <label htmlFor="roomName">Room Name *</label>
                <input
                  type="text"
                  id="roomName"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  required
                  placeholder="e.g., Room 101, Lab A, Library"
                  disabled={isCreatingClassroom}
                />
              </div>
              <div className="form-group">
                <label htmlFor="roomType">Room Type *</label>
                <select
                  id="roomType"
                  value={selectedRoomTypeId}
                  onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                  required
                  disabled={isCreatingClassroom}
                >
                  <option value="">Select Room Type</option>
                  {classroomTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="capacity">Capacity *</label>
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
                {isCreatingClassroom ? 'Adding...' : 'Add Classroom'}
              </button>
            </form>
          </div>

          <div className="table-container">
            <h4>Existing Classrooms</h4>
            {classrooms.length === 0 ? (
              <p className="no-data">No classrooms found. Add one above!</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room Name</th>
                    <th>Room Type</th>
                    <th>Capacity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classrooms.map((classroom) => (
                    <tr key={classroom._id}>
                      <td>{classroom.room_name}</td>
                      <td>{classroom.room_type_name || 'Unknown'}</td>
                      <td>{classroom.capacity}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteClassroom(classroom._id)}
                          className="btn btn--danger btn--small"
                        >
                          Delete
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
