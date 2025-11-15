import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface Resource {
  _id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_size: number;
  mime_type: string | null;
  school_year_id: string;
  subject_id: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  school_year_name?: string;
  subject_name?: string;
  year_level_name?: string;
  year_level_order?: number;
  uploaded_by_name?: string;
}

interface SchoolYear {
  _id: string;
  year_name: string;
  start_date?: string;
  end_date?: string;
}

interface Subject {
  _id: string;
  subject_name: string;
}

interface YearLevel {
  _id: string;
  level_name: string;
  level_order: number;
}

const TeacherResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Filters
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterYearLevel, setFilterYearLevel] = useState<string>('');
  
  // Upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadYearId, setUploadYearId] = useState('');
  const [uploadSubjectId, setUploadSubjectId] = useState('');
  const [uploadYearLevelId, setUploadYearLevelId] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadResources();
  }, [filterYear, filterSubject, filterYearLevel]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load school years, subjects, and year levels
      const [yearsRes, subjectsRes, yearLevelsRes] = await Promise.all([
        apiService.getSchoolYears(),
        apiService.getSubjects(),
        apiService.getYearLevels(),
      ]);

      if (yearsRes.success && yearsRes.data) {
        const yearsData = (yearsRes.data as any)?.message || yearsRes.data;
        let yearsArray = Array.isArray(yearsData) ? yearsData : (yearsData?.school_years || []);
        
        // Sort by start_date (most recent first)
        yearsArray = yearsArray.sort((a: SchoolYear, b: SchoolYear) => {
          const dateA = new Date(a.start_date || 0).getTime();
          const dateB = new Date(b.start_date || 0).getTime();
          return dateB - dateA; // Descending order (newest first)
        });
        
        setSchoolYears(yearsArray);
      }

      if (subjectsRes.success && subjectsRes.data) {
        const subjectsData = (subjectsRes.data as any)?.message || subjectsRes.data;
        let subjectsArray = Array.isArray(subjectsData) ? subjectsData : (subjectsData?.subjects || []);
        
        // Sort subjects alphabetically by name
        subjectsArray = subjectsArray.sort((a: Subject, b: Subject) => {
          return a.subject_name.localeCompare(b.subject_name);
        });
        
        setSubjects(subjectsArray);
      }

      if (yearLevelsRes.success && yearLevelsRes.data) {
        const yearLevelsData = (yearLevelsRes.data as any)?.message || yearLevelsRes.data;
        let yearLevelsArray = Array.isArray(yearLevelsData) ? yearLevelsData : (yearLevelsData?.year_levels || []);
        
        // Get unique year levels by level_order (one per grade - 1st, 2nd, 3rd, etc.)
        const uniqueYearLevels = yearLevelsArray.filter((level: YearLevel, index: number, self: YearLevel[]) =>
          index === self.findIndex((l: YearLevel) => l.level_order === level.level_order)
        );
        
        // Sort by level_order (ascending - 1st, 2nd, 3rd, etc.)
        uniqueYearLevels.sort((a: YearLevel, b: YearLevel) => {
          return a.level_order - b.level_order;
        });
        
        setYearLevels(uniqueYearLevels);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterYear) filters.school_year_id = filterYear;
      if (filterSubject) filters.subject_id = filterSubject;
      if (filterYearLevel) filters.year_level_id = filterYearLevel;

      const response = await apiService.getTeacherResources(filters);
      
      if (response.success && response.data) {
        const data = response.data as any;
        setResources(Array.isArray(data.resources) ? data.resources : data.resources?.resources || data || []);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile || !uploadTitle || !uploadYearId || !uploadSubjectId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      const response = await apiService.uploadResource(
        uploadFile,
        uploadTitle,
        uploadDescription,
        uploadYearId,
        uploadSubjectId,
        uploadYearLevelId || undefined
      );

      if (response.success) {
        alert('Resource uploaded successfully!');
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTitle('');
        setUploadDescription('');
        setUploadYearId('');
        setUploadSubjectId('');
        setUploadYearLevelId('');
        loadResources();
      } else {
        alert(response.error || 'Failed to upload resource');
      }
    } catch (error: any) {
      console.error('Error uploading resource:', error);
      alert(error.message || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const response = await apiService.deleteResource(resourceId);
      
      if (response.success) {
        alert('Resource deleted successfully!');
        loadResources();
      } else {
        alert(response.error || 'Failed to delete resource');
      }
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      alert(error.message || 'Failed to delete resource');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="teacher-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Resources</h2>
          <p>Upload and manage teaching materials and educational resources.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          + Upload Resource
        </button>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#ccc' }}>
            School Year
          </label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2a2a3a',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '5px',
              fontSize: '14px',
            }}
          >
            <option value="">All Years</option>
            {schoolYears.map((year) => (
              <option key={year._id} value={year._id}>
                {year.year_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#ccc' }}>
            Subject
          </label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2a2a3a',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '5px',
              fontSize: '14px',
            }}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.subject_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#ccc' }}>
            Grade
          </label>
          <select
            value={filterYearLevel}
            onChange={(e) => setFilterYearLevel(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2a2a3a',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '5px',
              fontSize: '14px',
            }}
          >
            <option value="">All Grades</option>
            {yearLevels
              .filter((level: YearLevel, index: number, self: YearLevel[]) => 
                index === self.findIndex((l: YearLevel) => l.level_order === level.level_order)
              )
              .map((level: YearLevel) => {
                const gradeNames = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
                const gradeName = gradeNames[level.level_order] || `${level.level_order}th`;
                return (
                  <option key={level._id} value={level._id}>
                    {gradeName}
                  </option>
                );
              })}
          </select>
        </div>
      </div>

      {/* Resources List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#ccc' }}>
          Loading resources...
        </div>
      ) : resources.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#888',
          backgroundColor: '#2a2a3a',
          borderRadius: '8px',
        }}>
          No resources found. Upload your first resource to get started!
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: '15px',
        }}>
          {resources.map((resource) => (
            <div
              key={resource._id}
              style={{
                backgroundColor: '#2a2a3a',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #444',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: '1' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '18px' }}>
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p style={{ margin: '0 0 10px 0', color: '#aaa', fontSize: '14px' }}>
                      {resource.description}
                    </p>
                  )}
                  <div style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    flexWrap: 'wrap',
                    fontSize: '13px',
                    color: '#888',
                    marginTop: '10px',
                  }}>
                    <span>📄 {resource.file_name}</span>
                    <span>📊 {formatFileSize(resource.file_size)}</span>
                    <span>📅 {formatDate(resource.created_at)}</span>
                    {resource.school_year_name && (
                      <span>📆 {resource.school_year_name}</span>
                    )}
                    {resource.subject_name && (
                      <span>📚 {resource.subject_name}</span>
                    )}
                    {resource.year_level_order && (
                      <span>🎓 {(() => {
                        const gradeNames = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
                        const gradeName = gradeNames[resource.year_level_order] || `${resource.year_level_order}th`;
                        return gradeName;
                      })()}</span>
                    )}
                    {resource.uploaded_by_name && (
                      <span>👤 {resource.uploaded_by_name}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleDelete(resource._id, resource.file_name)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => !uploading && setShowUploadModal(false)}
        >
          <div
            style={{
              backgroundColor: '#2a2a3a',
              padding: '30px',
              borderRadius: '10px',
              width: '90%',
              maxWidth: '500px',
              border: '1px solid #444',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 20px 0', color: '#fff' }}>Upload Resource</h2>
            
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '14px' }}>
                  File *
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1a1a2a',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: '5px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '14px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1a1a2a',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: '5px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '14px' }}>
                  Description
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1a1a2a',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: '5px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '14px' }}>
                  School Year *
                </label>
                <select
                  value={uploadYearId}
                  onChange={(e) => setUploadYearId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1a1a2a',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: '5px',
                  }}
                >
                  <option value="">Select Year</option>
                  {schoolYears.map((year) => (
                    <option key={year._id} value={year._id}>
                      {year.year_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '14px' }}>
                  Subject *
                </label>
                <select
                  value={uploadSubjectId}
                  onChange={(e) => setUploadSubjectId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1a1a2a',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: '5px',
                  }}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '14px' }}>
                  Grade
                </label>
                <select
                  value={uploadYearLevelId}
                  onChange={(e) => setUploadYearLevelId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1a1a2a',
                    color: '#fff',
                    border: '1px solid #444',
                    borderRadius: '5px',
                  }}
                >
                  <option value="">Select Grade (Optional)</option>
                  {yearLevels
                    .filter((level: YearLevel, index: number, self: YearLevel[]) => 
                      index === self.findIndex((l: YearLevel) => l.level_order === level.level_order)
                    )
                    .map((level: YearLevel) => {
                      const gradeNames = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
                      const gradeName = gradeNames[level.level_order] || `${level.level_order}th`;
                      return (
                        <option key={level._id} value={level._id}>
                          {gradeName}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#555',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4A90E2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherResources;

