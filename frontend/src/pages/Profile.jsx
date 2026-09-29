import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { User, Lock, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../services/api';

export const Profile = () => {
  const { user, role } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/change-password', { oldPassword, newPassword });
      setMessage({ text: 'Password updated successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setIsModalOpen(false), 1500);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-surface)', border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
            {user?.firstName?.[0] || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {user?.firstName} {user?.lastName}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              {user?.email}
            </p>
            <span className="badge badge-primary" style={{ marginTop: '0.5rem' }}>
              <Shield size={14} /> {role} ACCOUNT
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <label className="form-label">Username</label>
            <input className="form-input" value={user?.username || ''} readOnly />
          </div>
          <div>
            <label className="form-label">Email Address</label>
            <input className="form-input" value={user?.email || ''} readOnly />
          </div>
          <div>
            <label className="form-label">First Name</label>
            <input className="form-input" value={user?.firstName || ''} readOnly />
          </div>
          <div>
            <label className="form-label">Last Name</label>
            <input className="form-input" value={user?.lastName || ''} readOnly />
          </div>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn-secondary">
          <Lock size={18} /> Change Password
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Change Password">
        {message.text && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', background: message.type === 'success' ? 'var(--success-surface)' : 'var(--danger-surface)', color: message.type === 'success' ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="gradient-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
