import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface Term {
  _id: string;
  year_id: string;
  term_number: number;
  start_date: string;
  end_date: string;
  year_name?: string;
}

interface SchoolYear {
  _id: string;
  year_name: string;
  start_date: string;
  end_date: string;
}

const TermTable: React.FC = () => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('');
  const [formData, setFormData] = useState({
    year_id: '',
    term_number: 1,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchTerms();
    fetchSchoolYears();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await apiService.getTerms();
      if (response.success) {
        const termsData = (response.data as any)?.message || response.data;
        setTerms(termsData);
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolYears = async () => {
    try {
      const response = await apiService.getSchoolYears();
      if (response.success) {
        const yearsData = (response.data as any)?.message || response.data;
        setSchoolYears(yearsData);
      }
    } catch (error) {
      console.error('Error fetching school years:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        term_number: parseInt(formData.term_number.toString())
      };

      let response;
      if (editingTerm) {
        response = await apiService.updateTerm(editingTerm._id, data);
      } else {
        response = await apiService.createTerm(data);
      }

      if (response.success) {
        alert(editingTerm ? 'Term updated successfully!' : 'Term created successfully!');
        setShowModal(false);
        setEditingTerm(null);
        setFormData({ year_id: '', term_number: 1, start_date: '', end_date: '' });
        fetchTerms();
      } else {
        alert('Error: ' + (response.error || 'Failed to save term'));
      }
    } catch (error) {
      console.error('Error saving term:', error);
      alert('Error saving term');
    }
  };

  const handleEdit = (term: Term) => {
    setEditingTerm(term);
    setFormData({
      year_id: term.year_id,
      term_number: term.term_number,
      start_date: term.start_date.split('T')[0],
      end_date: term.end_date.split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this term?')) {
      try {
        const response = await apiService.deleteTerm(id);
        if (response.success) {
          alert('Term deleted successfully!');
          fetchTerms();
        } else {
          alert('Error: ' + (response.error || 'Failed to delete term'));
        }
      } catch (error) {
        console.error('Error deleting term:', error);
        alert('Error deleting term');
      }
    }
  };

  const getSchoolYearName = (yearId: string) => {
    const year = schoolYears.find(y => y._id === yearId);
    return year ? year.year_name : 'Unknown Year';
  };

  // Filter terms by selected year
  const filteredTerms = selectedYearFilter 
    ? terms.filter(t => t.year_id === selectedYearFilter)
    : terms;

  if (loading) {
    return <div>Loading terms...</div>;
  }

  return (
    <div className="term-management">
      <div className="management-header">
        <h2>Term Management</h2>
        <p>Manage academic terms for school years. Terms represent semesters or quarters within a school year.</p>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add New Term
        </button>
      </div>

      {/* Year Filter */}
      <div style={{ marginBottom: 'var(--space-md)', maxWidth: '400px' }}>
        <label htmlFor="year_filter" style={{ 
          display: 'block', 
          marginBottom: 'var(--space-xs)',
          fontSize: '0.875rem',
          fontWeight: 500 
        }}>
          Filter by School Year:
        </label>
        <select
          id="year_filter"
          value={selectedYearFilter}
          onChange={(e) => setSelectedYearFilter(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--space-sm)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: 'var(--text-base)',
            WebkitAppearance: 'menulist',
            MozAppearance: 'menulist',
            appearance: 'menulist'
          }}
        >
          <option value="">-- All Years --</option>
          {schoolYears.map((year) => (
            <option 
              key={year._id} 
              value={year._id}
              style={{ background: 'var(--card)', color: 'var(--text)' }}
            >
              {year.year_name}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Term Number</th>
              <th>School Year</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTerms.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No terms found</td>
              </tr>
            ) : (
              filteredTerms.map((term) => (
                <tr key={term._id}>
                  <td>Term {term.term_number}</td>
                  <td>{getSchoolYearName(term.year_id)}</td>
                  <td>{new Date(term.start_date).toLocaleDateString()}</td>
                  <td>{new Date(term.end_date).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(term)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(term._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal__dialog">
            <div className="modal__content">
              <div className="modal__header">
                <h3>{editingTerm ? 'Edit Term' : 'Add New Term'}</h3>
                <button 
                  className="modal__close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTerm(null);
                    setFormData({ year_id: '', term_number: 1, start_date: '', end_date: '' });
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="student-form">
                <div className="form-group">
                  <label htmlFor="year_id">School Year *</label>
                  <select
                    id="year_id"
                    value={formData.year_id}
                    onChange={(e) => setFormData({ ...formData, year_id: e.target.value })}
                    required
                  >
                    <option value="">Select School Year</option>
                    {schoolYears.map((year) => (
                      <option key={year._id} value={year._id}>
                        {year.year_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="term_number">Term Number *</label>
                  <select
                    id="term_number"
                    value={formData.term_number}
                    onChange={(e) => setFormData({ ...formData, term_number: parseInt(e.target.value) })}
                    required
                  >
                    <option value={1}>Term 1</option>
                    <option value={2}>Term 2</option>
                    <option value={3}>Term 3</option>
                    <option value={4}>Term 4</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="start_date">Start Date *</label>
                  <input
                    type="date"
                    id="start_date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_date">End Date *</label>
                  <input
                    type="date"
                    id="end_date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingTerm ? 'Update Term' : 'Create Term'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTerm(null);
                      setFormData({ year_id: '', term_number: 1, start_date: '', end_date: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermTable;
