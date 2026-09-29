import React, { useState, useEffect } from 'react';
import { Award, Plus, Lock, Unlock } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import API from '../../services/api';

export const FacultyGrades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [gradeType, setGradeType] = useState('INTERNAL');
  const [marks, setMarks] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    fetchGrades();
    fetchStudents();
    fetchSubjects();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await API.get('/grades');
      setGrades(Array.isArray(res.data) ? res.data : (res.data?.content || []));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get('/students?size=100');
      setStudents(res.data?.content || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await API.get('/subjects');
      setSubjects(Array.isArray(res.data) ? res.data : (res.data?.content || []));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    try {
      await API.post('/grades', {
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        gradeType,
        marksObtained: parseFloat(marks),
        published
      });
      setIsModalOpen(false);
      setStudentId('');
      setMarks('');
      fetchGrades();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enter grade');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Grade Management System
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Submit internal & final exam scores and manage published visibility gate
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="gradient-btn">
          <Plus size={18} /> Enter Grade Record
        </button>
      </div>

      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              <th>Evaluation Type</th>
              <th>Score</th>
              <th>Letter Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {grades.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No grade records found.
                </td>
              </tr>
            ) : (
              grades.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 700 }}>
                    {g.student?.user ? `${g.student.user.firstName} ${g.student.user.lastName}` : (g.studentName || `${g.student?.firstName || ''} ${g.student?.lastName || ''}`.trim() || 'Student')}
                  </td>
                  <td>{g.subject?.name || g.subjectName} ({g.subject?.code || g.subjectCode})</td>
                  <td><span className="badge badge-info">{g.gradeType || 'OVERALL'}</span></td>
                  <td style={{ fontWeight: 800 }}>{g.marksObtained ?? g.totalMarks ?? 0} Marks</td>
                  <td><span className="badge badge-primary" style={{ fontSize: '0.9rem' }}>{g.letterGrade || g.grade || 'N/A'}</span></td>
                  <td>
                    <span className={`badge ${g.published ? 'badge-success' : 'badge-warning'}`}>
                      {g.published ? 'Published to Student' : 'Draft / Private'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Grade Record">
        <form onSubmit={handleSaveGrade}>
          <div className="form-group">
            <label className="form-label">Student</label>
            <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.firstName || s.user?.firstName} {s.lastName || s.user?.lastName} ({s.studentCode || s.rollNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <select className="form-select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Evaluation Type</label>
              <select className="form-select" value={gradeType} onChange={(e) => setGradeType(e.target.value)}>
                <option value="INTERNAL">INTERNAL</option>
                <option value="ASSIGNMENT">ASSIGNMENT</option>
                <option value="MIDTERM">MIDTERM</option>
                <option value="FINAL">FINAL</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Marks Obtained</label>
              <input type="number" step="0.1" max={100} className="form-input" value={marks} onChange={(e) => setMarks(e.target.value)} required />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input type="checkbox" id="published" checked={published} onChange={(e) => setPublished(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <label htmlFor="published" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              Publish immediately to student portal
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="gradient-btn">Save Grade</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
