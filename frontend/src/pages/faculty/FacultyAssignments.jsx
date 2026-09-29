import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle, Download, Award } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import API from '../../services/api';

export const FacultyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isSubmissionsModal, setIsSubmissionsModal] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');

  const [formData, setFormData] = useState({
    title: '', description: '', subjectId: '',
    className: 'CS-A', dueDate: '', maxMarks: 100
  });

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await API.get('/assignments');
      const data = res.data?.content || res.data;
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAssignments([]);
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/assignments', {
        ...formData,
        subjectId: parseInt(formData.subjectId),
        maxMarks: parseInt(formData.maxMarks)
      });
      setIsCreateModal(false);
      setFormData({
        title: '', description: '', subjectId: '',
        className: 'CS-A', dueDate: '', maxMarks: 100
      });
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const viewSubmissions = async (asg) => {
    setSelectedAssignment(asg);
    try {
      const res = await API.get(`/assignments/${asg.id}/submissions`);
      setSubmissions(Array.isArray(res.data) ? res.data : (res.data?.content || []));
      setIsSubmissionsModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      const score = parseFloat(marks);
      await API.put(`/assignments/submissions/${gradingSubmission.id}/grade`, {
        marks: score,
        marksObtained: score,
        feedback
      });
      setGradingSubmission(null);
      viewSubmissions(selectedAssignment);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grade submission');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Assignments & Grading
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Publish course assignments and evaluate student submissions
          </p>
        </div>
        <button onClick={() => setIsCreateModal(true)} className="gradient-btn">
          <Plus size={18} /> Create Assignment
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {(!Array.isArray(assignments) || assignments.length === 0) ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            No assignments created yet.
          </div>
        ) : (
          assignments.map(a => (
            <div key={a.id} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span className="badge badge-primary">{a.subject?.code}</span>
                <span className="badge badge-info">Due: {a.dueDate}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>{a.title}</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{a.description}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Max Marks: {a.maxMarks}</span>
                <button onClick={() => viewSubmissions(a)} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                  View Submissions
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModal} onClose={() => setIsCreateModal(false)} title="Create New Assignment">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <select className="form-select" value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} required>
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Class Section</label>
              <select className="form-select" value={formData.className} onChange={(e) => setFormData({ ...formData, className: e.target.value })}>
                <option value="CS-A">CS-A</option>
                <option value="CS-B">CS-B</option>
                <option value="EC-A">EC-A</option>
                <option value="ME-A">ME-A</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Max Marks</label>
              <input type="number" className="form-input" value={formData.maxMarks} onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })} required />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="gradient-btn">Publish Assignment</button>
          </div>
        </form>
      </Modal>

      {/* View Submissions Modal */}
      <Modal isOpen={isSubmissionsModal} onClose={() => setIsSubmissionsModal(false)} title={`Submissions for: ${selectedAssignment?.title}`} maxWidth="750px">
        <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Submitted At</th>
                <th>File</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No submissions received yet.
                  </td>
                </tr>
              ) : (
                submissions.map(sub => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 700 }}>
                      {sub.student?.user ? `${sub.student.user.firstName} ${sub.student.user.lastName}` : (sub.student?.firstName ? `${sub.student.firstName} ${sub.student.lastName}` : 'Student')}
                    </td>
                    <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                    <td>
                      {sub.filePath ? (
                        <a href={`http://localhost:8080/uploads/${sub.filePath}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          <Download size={14} /> Download
                        </a>
                      ) : 'No File'}
                    </td>
                    <td>
                      {(sub.marks !== null && sub.marks !== undefined) || (sub.marksObtained !== null && sub.marksObtained !== undefined) ? (
                        <span className="badge badge-success">{sub.marks ?? sub.marksObtained} / {selectedAssignment?.maxMarks}</span>
                      ) : (
                        <span className="badge badge-warning">Ungraded</span>
                      )}
                    </td>
                    <td>
                      <button onClick={() => { setGradingSubmission(sub); setMarks(sub.marks ?? sub.marksObtained ?? ''); setFeedback(sub.feedback || ''); }} className="gradient-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                        <Award size={14} /> Grade
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {gradingSubmission && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 800 }}>
              Grade {gradingSubmission.student?.user?.firstName || 'Student'}'s Submission
            </h4>
            <form onSubmit={handleGradeSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Marks Obtained</label>
                  <input type="number" step="0.5" className="form-input" value={marks} onChange={(e) => setMarks(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Feedback Comments</label>
                  <input className="form-input" placeholder="e.g. Great code structure!" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setGradingSubmission(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="gradient-btn">Save Score</button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};
