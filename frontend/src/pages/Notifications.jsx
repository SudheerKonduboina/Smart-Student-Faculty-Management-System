import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Send, CheckCheck, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import API from '../services/api';

export const Notifications = () => {
  const { role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBroadcastModal, setIsBroadcastModal] = useState(false);

  // Broadcast Form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [sendLoading, setSendLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications/my');
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSendLoading(true);
    try {
      await API.post('/notifications/broadcast', {
        title,
        message,
        targetRole,
        type: 'INFO'
      });
      setIsBroadcastModal(false);
      setTitle('');
      setMessage('');
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to broadcast');
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Notifications & Announcements
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            System updates, academic notices, and personal alerts
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={markAllRead} className="btn-secondary">
            <CheckCheck size={18} /> Mark All Read
          </button>
          {role === 'ADMIN' && (
            <button onClick={() => setIsBroadcastModal(true)} className="gradient-btn">
              <Send size={18} /> Broadcast Announcement
            </button>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Bell size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
            <p>No notifications at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {notifications.map(n => (
              <div
                key={n.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: n.read ? 'var(--bg-tertiary)' : 'var(--accent-surface)',
                  border: n.read ? '1px solid var(--border-light)' : '1px solid rgba(99, 102, 241, 0.4)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}
              >
                <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--bg-secondary)', color: 'var(--accent-primary)', marginTop: '0.15rem' }}>
                  <Info size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Broadcast Modal for Admin */}
      <Modal isOpen={isBroadcastModal} onClose={() => setIsBroadcastModal(false)} title="Broadcast System Announcement">
        <form onSubmit={handleBroadcast}>
          <div className="form-group">
            <label className="form-label">Notice Title</label>
            <input className="form-input" placeholder="e.g. Mid-term Exam Schedule Released" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <select className="form-select" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
              <option value="ALL">All Users (Students + Faculty + Admins)</option>
              <option value="STUDENT">Students Only</option>
              <option value="FACULTY">Faculty Only</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Message Content</label>
            <textarea className="form-textarea" rows={4} placeholder="Type announcement details here..." value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsBroadcastModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="gradient-btn" disabled={sendLoading}>
              {sendLoading ? 'Broadcasting...' : 'Broadcast Now'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
