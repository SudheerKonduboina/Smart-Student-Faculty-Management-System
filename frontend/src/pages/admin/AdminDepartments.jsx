import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import API from '../../services/api';

export const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/departments/${editingId}`, { code, name, active: true });
      } else {
        await API.post('/departments', { code, name });
      }
      setIsModalOpen(false);
      setCode('');
      setName('');
      setEditingId(null);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const openEdit = (dept) => {
    setEditingId(dept.id);
    setCode(dept.code);
    setName(dept.name);
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Department Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Academic divisions, codes, and active status
          </p>
        </div>
        <button onClick={() => { setEditingId(null); setCode(''); setName(''); setIsModalOpen(true); }} className="gradient-btn">
          <Plus size={18} /> Add Department
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {departments.map(d => (
          <div key={d.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.85rem', fontWeight: 800 }}>{d.code}</span>
                <span className={`badge ${d.active ? 'badge-success' : 'badge-danger'}`}>{d.active ? 'Active' : 'Inactive'}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{d.name}</h3>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID: #{d.id}</span>
              <button onClick={() => openEdit(d)} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                <Edit2 size={14} /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Department' : 'Create Department'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Department Code</label>
            <input className="form-input" placeholder="e.g. CSE" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input className="form-input" placeholder="e.g. Computer Science & Engineering" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="gradient-btn">{editingId ? 'Save Changes' : 'Create Department'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
