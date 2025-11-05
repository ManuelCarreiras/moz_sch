import React, { useState, useMemo } from 'react';

interface Assignment {
  _id: string;
  assignment: {
    title: string;
    due_date?: string;
    max_score: number;
  };
  subject_name?: string;
  class_name?: string;
  status: string;
  score: number | null;
}

interface StudentAssignmentCalendarProps {
  assignments: Assignment[];
}

const StudentAssignmentCalendar: React.FC<StudentAssignmentCalendarProps> = ({ assignments }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get assignments grouped by date
  const assignmentsByDate = useMemo(() => {
    const byDate: Record<string, Assignment[]> = {};
    
    assignments.forEach(sa => {
      if (sa.assignment.due_date) {
        const date = new Date(sa.assignment.due_date);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!byDate[dateKey]) {
          byDate[dateKey] = [];
        }
        byDate[dateKey].push(sa);
      }
    });
    
    return byDate;
  }, [assignments]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentMonth]);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getAssignmentsForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return assignmentsByDate[dateKey] || [];
  };

  return (
    <div className="assignment-calendar">
      {/* Calendar Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '4px'
      }}>
        <button className="btn btn-secondary" onClick={previousMonth}>
          ← Previous
        </button>
        <h3 style={{ margin: 0 }}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button className="btn btn-secondary" onClick={nextMonth}>
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '1px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ 
            padding: '0.5rem', 
            background: 'rgba(255, 255, 255, 0.1)', 
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} style={{ background: '#1a1f2e', minHeight: '100px' }} />;
          }
          
          const dayAssignments = getAssignmentsForDate(date);
          const today = isToday(date);
          
          return (
            <div 
              key={date.toISOString()} 
              style={{ 
                background: today ? 'rgba(59, 130, 246, 0.2)' : '#1e2936',
                minHeight: '100px',
                padding: '0.5rem',
                position: 'relative',
                border: today ? '2px solid #3b82f6' : 'none'
              }}
            >
              <div style={{ 
                fontWeight: today ? 600 : 400,
                fontSize: '0.9rem',
                marginBottom: '0.25rem',
                color: today ? '#3b82f6' : '#fff'
              }}>
                {date.getDate()}
              </div>
              
              {dayAssignments.map((sa) => (
                <div 
                  key={sa._id}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem',
                    marginBottom: '0.25rem',
                    background: sa.status === 'graded' 
                      ? '#28a745' 
                      : sa.status === 'submitted' 
                        ? '#ffc107' 
                        : '#dc3545',
                    color: sa.status === 'submitted' ? '#000' : '#fff',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                  title={`${sa.assignment.title} - ${sa.subject_name} (${sa.status})`}
                >
                  {sa.assignment.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '4px',
        display: 'flex',
        gap: '1.5rem',
        fontSize: '0.85rem'
      }}>
        <div><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#dc3545', marginRight: '0.5rem', borderRadius: '2px' }}></span> Not Submitted</div>
        <div><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#ffc107', marginRight: '0.5rem', borderRadius: '2px' }}></span> Submitted</div>
        <div><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#28a745', marginRight: '0.5rem', borderRadius: '2px' }}></span> Graded</div>
        <div><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#e74c3c', marginRight: '0.5rem', borderRadius: '2px' }}></span> Late</div>
      </div>
    </div>
  );
};

export default StudentAssignmentCalendar;

