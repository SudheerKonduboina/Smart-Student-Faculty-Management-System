import React, { useState, useEffect } from 'react';
import { CheckSquare, Save, Users, Calendar, Clock } from 'lucide-react';
import API from '../../services/api';

export const FacultyAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [className, setClassName] = useState('CS-A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchStudents();
  }, [className]);

  const fetchSubjects = async () => {
    try {
      const res = await API.get('/subjects');
      setSubjects(res.data || []);
      if (res.data.length > 0) setSelectedSubject(res.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get('/students?size=100');
      const studentList = res.data?.content || res.data || [];
      setStudents(studentList);
      // Default all to PRESENT
      const initial = {};
      studentList.forEach(s => { initial[s.id] = 'PRESENT'; });
      setRecords(initial);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const studentRecords = Object.entries(records).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        status
      }));

      await API.post('/attendance/mark-manual', {
        subjectId: parseInt(selectedSubject),
        className,
        date,
        records: studentRecords
      });

      setMessage('Attendance session saved successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Manual Attendance Register
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Select class & subject to mark student daily presence
        </p>
      </div>

      {message && (
        <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'var(--success-surface)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Class & Subject Selector */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div>
          <label className="form-label">Subject</label>
          <select className="form-select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>

        <div>
          <label className="form-label">Class Section</label>
          <select className="form-select" value={className} onChange={(e) => setClassName(e.target.value)}>
            <option value="CS-A">CS-A</option>
            <option value="CS-B">CS-B</option>
            <option value="EC-A">EC-A</option>
            <option value="ME-A">ME-A</option>
          </select>
        </div>

        <div>
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td><span className="badge badge-primary">{s.studentCode || s.rollNumber}</span></td>
                <td style={{ fontWeight: 700 }}>{s.firstName || s.user?.firstName} {s.lastName || s.user?.lastName}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['PRESENT', 'ABSENT'].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(s.id, st)}
                        className={`badge ${records[s.id] === st ? (st === 'PRESENT' ? 'badge-success' : 'badge-danger') : 'btn-secondary'}`}
                        style={{ cursor: 'pointer', border: records[s.id] === st ? '2px solid currentColor' : '1px solid var(--border-light)' }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSubmit} className="gradient-btn" disabled={loading || students.length === 0}>
          <Save size={18} /> {loading ? 'Saving Register...' : 'Save Attendance Register'}
        </button>
      </div>
    </div>
  );
};
