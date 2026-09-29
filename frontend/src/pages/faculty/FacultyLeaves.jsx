import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import API from '../../services/api';

export const FacultyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [status, setStatus] = useState('APPROVED');
  const [comments, setComments] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await API.get('/leaves');
      setLeaves(res.data.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/leaves/${selectedLeave.id}/review`, { status, comments });
      setIsModalOpen(false);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Review action failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Student Leave Applications
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Review absence applications submitted by students in your department
        </p>
      </div>

      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Leave Dates</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map(l => (
              <tr key={l.id}>
                <td style={{ fontWeight: 700 }}>{l.student?.user?.firstName} {l.student?.user?.lastName}</td>
                <td>{l.startDate} to {l.endDate}</td>
                <td>{l.reason}</td>
                <td>
                  <span className={`badge ${l.status === 'APPROVED' ? 'badge-success' : l.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                    {l.status}
                  </span>
                </td>
                <td>
                  {l.status === 'PENDING' ? (
                    <button onClick={() => { setSelectedLeave(l); setIsModalOpen(true); }} className="gradient-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                      Review Request
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Reviewed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Review Leave Application">
        <form onSubmit={handleReview}>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <strong>Reason:</strong> "{selectedLeave?.reason}"
          </p>

          <div className="form-group">
            <label className="form-label">Decision</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="APPROVED">Approve Leave</option>
              <option value="REJECTED">Reject Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Faculty Feedback / Comments</label>
            <textarea className="form-textarea" rows={3} placeholder="Provide justification or instructions..." value={comments} onChange={(e) => setComments(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="gradient-btn">Submit Decision</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
