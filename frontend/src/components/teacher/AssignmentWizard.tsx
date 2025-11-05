import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface AssignmentWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  editingAssignment?: Assignment | null;
}

interface Assignment {
  _id: string;
  title: string;
  description?: string;
  subject_id: string;
  class_id: string;
  assessment_type_id: string;
  term_id: string;
  due_date?: string;
  max_score: number;
  weight: number;
  status: string;
}

interface AssessmentType {
  _id: string;
  type_name: string;
}

interface Department {
  _id: string;
  department_name: string;
}

interface Subject {
  _id: string;
  subject_name: string;
  department_id: string;
}

interface SchoolYear {
  _id: string;
  year_name: string;
  start_date?: string;
  end_date?: string;
}

interface Term {
  _id: string;
  term_number: number;
  year_id: string;
}

interface Class {
  _id: string;
  class_name: string;
  subject_id: string;
  subject_name?: string;
  term_id: string;
  term_number?: number;
  year_id?: string;
  year_name?: string;
}

const AssignmentWizard: React.FC<AssignmentWizardProps> = ({ onClose, onSuccess, editingAssignment }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    assessment_type_id: '',
    term_id: '',
    due_date: '',
    max_score: 100,
    weight: 10,
    status: 'draft'
  });

  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  // Data states
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingAssignment) {
      setFormData({
        title: editingAssignment.title,
        description: editingAssignment.description || '',
        class_id: editingAssignment.class_id,
        subject_id: editingAssignment.subject_id,
        assessment_type_id: editingAssignment.assessment_type_id,
        term_id: editingAssignment.term_id,
        due_date: editingAssignment.due_date ? editingAssignment.due_date.split('T')[0] : '',
        max_score: editingAssignment.max_score,
        weight: editingAssignment.weight,
        status: editingAssignment.status
      });
    }
  }, [editingAssignment]);

  const loadData = async () => {
    try {
      setDataLoading(true);
      console.log('Starting to load data...');
      
      // Load assessment types
      const typesResponse = await apiService.getAssessmentTypes();
      console.log('Assessment types response:', typesResponse);
      if (typesResponse.success && typesResponse.data) {
        // API returns data in 'message' property
        const responseData = (typesResponse.data as any)?.message || typesResponse.data;
        const types = responseData?.assessment_types || (Array.isArray(responseData) ? responseData : []);
        setAssessmentTypes(types);
      }

      // Load departments
      const deptResponse = await apiService.getDepartments();
      console.log('Departments response:', deptResponse);
      if (deptResponse.success && deptResponse.data) {
        // API returns array directly in 'message' property
        const depts = (deptResponse.data as any)?.message || [];
        setDepartments(Array.isArray(depts) ? depts : []);
      }

      // Load subjects
      const subjectResponse = await apiService.getSubjects();
      console.log('Subjects response:', subjectResponse);
      if (subjectResponse.success && subjectResponse.data) {
        // API returns array directly in 'message' property
        const subs = (subjectResponse.data as any)?.message || [];
        setSubjects(Array.isArray(subs) ? subs : []);
      }

      // Load school years - only show current or upcoming year
      const yearResponse = await apiService.getSchoolYears();
      console.log('School years response:', yearResponse);
      if (yearResponse.success && yearResponse.data) {
        // API returns array directly in 'message' property
        const allYears = (yearResponse.data as any)?.message || [];
        const yearsArray = Array.isArray(allYears) ? allYears : [];
        
        // Filter to current/upcoming year (active year or next year if current year has ended)
        const now = new Date();
        const activeYears = yearsArray.filter((year: SchoolYear) => {
          if (!year.start_date || !year.end_date) return false;
          const startDate = new Date(year.start_date);
          const endDate = new Date(year.end_date);
          // Include if: currently active OR starts within next 6 months
          const sixMonthsFromNow = new Date(now.getTime() + (6 * 30 * 24 * 60 * 60 * 1000));
          return (now >= startDate && now <= endDate) || (startDate <= sixMonthsFromNow && endDate >= now);
        });
        
        // If no active year found, just use the latest year
        let yearsToShow = activeYears;
        if (activeYears.length === 0 && yearsArray.length > 0) {
          // Sort by start_date descending and take the most recent
          const sorted = [...yearsArray].sort((a, b) => {
            if (!a.start_date || !b.start_date) return 0;
            return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
          });
          yearsToShow = [sorted[0]];
        }
        
        setSchoolYears(yearsToShow);
        
        // Auto-select the year if only one exists
        if (yearsToShow.length === 1) {
          setSelectedYear(yearsToShow[0]._id);
        }
      }

      // Load all terms
      const termResponse = await apiService.getTerms();
      console.log('Terms response:', termResponse);
      if (termResponse.success && termResponse.data) {
        // API returns array directly in 'message' property
        const allTerms = (termResponse.data as any)?.message || [];
        setTerms(Array.isArray(allTerms) ? allTerms : []);
      }

      // Load teacher's classes from schedule
      const scheduleResponse = await apiService.get('/teacher/schedule');
      console.log('Teacher schedule response:', scheduleResponse);
      if (scheduleResponse.success && scheduleResponse.data) {
        const responseData = (scheduleResponse.data as any)?.message || scheduleResponse.data;
        const classData = responseData?.timetable || [];
        console.log('Parsed class data:', classData);
        setAllClasses(classData);
        setFilteredClasses(classData); // Initially show all
      }
      
      console.log('Data loading complete');
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Cascading filter effect
  useEffect(() => {
    if (!allClasses || allClasses.length === 0) {
      setFilteredClasses([]);
      return;
    }

    let filtered = [...allClasses];

    // Filter by department (via subject)
    if (selectedDepartment && subjects && subjects.length > 0) {
      const deptSubjects = subjects.filter(s => s.department_id === selectedDepartment).map(s => s._id);
      filtered = filtered.filter(c => deptSubjects.includes(c.subject_id));
    }

    // Filter by subject
    if (selectedSubject) {
      filtered = filtered.filter(c => c.subject_id === selectedSubject);
    }

    // Filter by year
    if (selectedYear && terms && terms.length > 0) {
      const yearTerms = terms.filter(t => t.year_id === selectedYear).map(t => t._id);
      filtered = filtered.filter(c => yearTerms.includes(c.term_id));
    }

    // Filter by term
    if (selectedTerm) {
      filtered = filtered.filter(c => c.term_id === selectedTerm);
    }

    // De-duplicate by class_name + subject_id + term_id combination
    // (same class can appear multiple times for different periods/days)
    const uniqueClasses = filtered.reduce((acc: Class[], current) => {
      const key = `${current.class_name}-${current.subject_id}-${current.term_id}`;
      const existing = acc.find(c => `${c.class_name}-${c.subject_id}-${c.term_id}` === key);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);

    setFilteredClasses(uniqueClasses);
  }, [selectedDepartment, selectedSubject, selectedYear, selectedTerm, allClasses, subjects, terms]);

  // Get filtered subjects based on selected department
  const getFilteredSubjects = () => {
    if (!subjects || subjects.length === 0) return [];
    if (!selectedDepartment) return subjects;
    return subjects.filter(s => s.department_id === selectedDepartment);
  };

  // Get filtered terms based on selected year
  const getFilteredTerms = () => {
    if (!terms || terms.length === 0) return [];
    if (!selectedYear) return terms;
    return terms.filter(t => t.year_id === selectedYear);
  };

  const handleClassChange = (classId: string) => {
    const selectedClass = filteredClasses.find(c => c._id === classId);
    if (selectedClass) {
      setFormData({
        ...formData,
        class_id: classId,
        subject_id: selectedClass.subject_id,
        term_id: selectedClass.term_id || ''
      });
    }
  };

  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartment(deptId);
    setSelectedSubject(''); // Reset subject when department changes
    setFormData({ ...formData, class_id: '', subject_id: '', term_id: '' }); // Reset class selection
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setFormData({ ...formData, class_id: '', subject_id: subjectId, term_id: '' }); // Reset class but keep subject
  };

  const handleYearChange = (yearId: string) => {
    setSelectedYear(yearId);
    setSelectedTerm(''); // Reset term when year changes
    setFormData({ ...formData, class_id: '', term_id: '' }); // Reset class selection
  };

  const handleTermChange = (termId: string) => {
    setSelectedTerm(termId);
    setFormData({ ...formData, class_id: '', term_id: termId }); // Reset class but keep term
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        max_score: Number(formData.max_score),
        weight: Number(formData.weight),
        due_date: formData.due_date || null
      };

      let response;
      if (editingAssignment) {
        response = await apiService.updateAssignment(editingAssignment._id, payload);
      } else {
        response = await apiService.createAssignment(payload);
      }

      if (response.success) {
        alert(editingAssignment ? 'Assignment updated successfully!' : 'Assignment created successfully!');
        onSuccess();
        onClose();
      } else {
        alert('Error: ' + (response.message || response.error || 'Failed to save assignment'));
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Error saving assignment');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while data is being fetched
  if (dataLoading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h3>Loading...</h3>
          <p>Fetching data, please wait...</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
          <div className="modal-header">
            <h3>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          <form onSubmit={handleSubmit}>
          {/* Cascading Filters */}
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '4px', 
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '0.9rem', color: '#aaa' }}>
              Filter Classes (Optional - narrows down options)
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label>Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  disabled={!!editingAssignment}
                >
                  <option value="">All Departments</option>
                  {(departments || []).map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label>Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={!!editingAssignment}
                >
                  <option value="">All Subjects</option>
                  {getFilteredSubjects().map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label>School Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  disabled={!!editingAssignment}
                >
                  <option value="">All Years</option>
                  {(schoolYears || []).map((year) => (
                    <option key={year._id} value={year._id}>
                      {year.year_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label>Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => handleTermChange(e.target.value)}
                  disabled={!!editingAssignment}
                >
                  <option value="">All Terms</option>
                  {getFilteredTerms().map((term) => (
                    <option key={term._id} value={term._id}>
                      Term {term.term_number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Class *</label>
            <select
              value={formData.class_id}
              onChange={(e) => handleClassChange(e.target.value)}
              required
              disabled={!!editingAssignment}
            >
              <option value="">Select a class</option>
              {(filteredClasses || []).map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
            <small>Showing {(filteredClasses || []).length} of {(allClasses || []).length} classes</small>
          </div>

          <div className="form-group">
            <label>Assignment Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Chapter 5 Quiz, Midterm Exam"
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>Assessment Type *</label>
            <select
              value={formData.assessment_type_id}
              onChange={(e) => setFormData({ ...formData, assessment_type_id: e.target.value })}
              required
            >
              <option value="">Select type</option>
              {(assessmentTypes || []).map((type) => (
                <option key={type._id} value={type._id}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Assignment instructions or details (optional)"
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Max Score *</label>
              <input
                type="number"
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: Number(e.target.value) })}
                min="1"
                step="0.01"
                required
              />
              <small>Points possible</small>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Weight (%) *</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                min="0"
                max="100"
                step="0.01"
                required
              />
              <small>% of final grade</small>
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
              <small>Students see published only</small>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (editingAssignment ? 'Update Assignment' : 'Create Assignment')}
            </button>
          </div>
        </form>
      </div>
    </div>
    );
  } catch (error) {
    console.error('Error rendering AssignmentWizard:', error);
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>Error Loading Form</h3>
          <p>There was an error loading the assignment form. Please check the console for details.</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }
};

export default AssignmentWizard;

