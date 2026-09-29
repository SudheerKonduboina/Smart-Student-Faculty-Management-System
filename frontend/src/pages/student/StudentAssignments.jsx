import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle2, Clock, Download } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import API from '../../services/api';

export const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await API.get('/assignments');
      setAssignments(res.data?.content || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await API.post(`/assignments/${selectedAsg.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsModalOpen(false);
      setFile(null);
      fetchAssignments();
      alert('Assignment submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          My Course Homework & Submissions
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          View pending assignments, submit solutions, and track grades
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {assignments.map(a => (
          <div key={a.id} className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span className="badge badge-primary">{a.subject?.code}</span>
              <span className="badge badge-warning">Due: {a.dueDate}</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>{a.title}</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{a.description}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Max Marks: {a.maxMarks}</span>
              <button onClick={() => { setSelectedAsg(a); setIsModalOpen(true); }} className="gradient-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                <Upload size={14} /> Submit Work
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Submit Work: ${selectedAsg?.title}`}>
        <form onSubmit={handleUploadSubmit}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Upload your homework solution file (PDF, Zip, Doc, PNG max 10MB).
          </p>

          <div className="form-group">
            <label className="form-label">Select File</label>
            <input type="file" className="form-input" onChange={(e) => setFile(e.target.files[0])} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="gradient-btn" disabled={loading}>
              {loading ? 'Uploading...' : 'Confirm Submission'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
