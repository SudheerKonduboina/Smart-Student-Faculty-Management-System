import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import API from '../../services/api';

export const AdminSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(4);
  const [departmentId, setDepartmentId] = useState('');
  const [facultyId, setFacultyId] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
    fetchFaculties();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await API.get('/subjects');
      setSubjects(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await API.get('/faculty');
      setFaculties(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/subjects', {
        code, name, credits: parseInt(credits),
        departmentId: parseInt(departmentId),
        facultyId: facultyId ? parseInt(facultyId) : null
      });
      setIsModalOpen(false);
      setCode('');
      setName('');
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create subject');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Subject Catalog
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Course offerings, credit hours, department association, and assigned faculty
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="gradient-btn">
          <Plus size={18} /> Add Subject
        </button>
      </div>

      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject Name</th>
              <th>Credits</th>
              <th>Department</th>
              <th>Assigned Faculty</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s.id}>
                <td><span className="badge badge-primary">{s.code}</span></td>
                <td style={{ fontWeight: 700 }}>{s.name}</td>
                <td>{s.credits} Credits</td>
                <td>{s.department?.name || 'N/A'}</td>
                <td>
                  {s.faculty ? (
                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                      Prof. {s.faculty.user?.firstName} {s.faculty.user?.lastName}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Subject">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Subject Code</label>
            <input className="form-input" placeholder="e.g. CS101" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Subject Name</label>
            <input className="form-input" placeholder="e.g. Data Structures & Algorithms" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Credits</label>
            <input type="number" className="form-input" min={1} max={10} value={credits} onChange={(e) => setCredits(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-select" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assign Faculty (Optional)</label>
            <select className="form-select" value={facultyId} onChange={(e) => setFacultyId(e.target.value)}>
              <option value="">Unassigned</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.user?.firstName} {f.user?.lastName} ({f.employeeId})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="gradient-btn">Save Subject</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
