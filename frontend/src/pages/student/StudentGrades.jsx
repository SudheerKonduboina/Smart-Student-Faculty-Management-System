import React, { useState, useEffect } from 'react';
import { Award, BookOpen, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';

export const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await API.get('/grades/my');
      setGrades(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // GPA calculation helper
  const calculateGPA = () => {
    if (grades.length === 0) return '0.00';
    const totalPoints = grades.reduce((acc, g) => {
      const point = g.letterGrade === 'A+' ? 10 : g.letterGrade === 'A' ? 9 : g.letterGrade === 'B+' ? 8 : g.letterGrade === 'B' ? 7 : 5;
      return acc + point;
    }, 0);
    return (totalPoints / grades.length).toFixed(2);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Official Academic Report Card
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Published internal evaluations, midterm exams, and final grade transcripts
          </p>
        </div>

        <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(99,102,241,0.3)' }}>
          <Award size={24} color="var(--accent-primary)" />
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUMULATIVE GPA</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{calculateGPA()} / 10.0</div>
          </div>
        </div>
      </div>

      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Evaluation Type</th>
              <th>Score</th>
              <th>Letter Grade</th>
              <th>Publication Gate</th>
            </tr>
          </thead>
          <tbody>
            {grades.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No published grades available yet.
                </td>
              </tr>
            ) : (
              grades.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 700 }}>{g.subject?.name} ({g.subject?.code})</td>
                  <td><span className="badge badge-info">{g.gradeType}</span></td>
                  <td style={{ fontWeight: 800 }}>{g.marksObtained} Marks</td>
                  <td><span className="badge badge-primary" style={{ fontSize: '0.9rem' }}>{g.letterGrade}</span></td>
                  <td>
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Verified & Published
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
