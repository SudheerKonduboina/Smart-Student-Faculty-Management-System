import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, CheckCircle, XCircle, UserPlus, Shield, GraduationCap, School } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import API from '../../services/api';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', role: 'STUDENT',
    firstName: '', lastName: '', rollNumber: '', className: '',
    semester: 1, employeeId: '', designation: '', departmentId: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [roleFilter, page]);

  const fetchUsers = async () => {
    try {
      const res = await API.get(`/users?role=${roleFilter}&page=${page}&size=10`);
      setUsers(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const handleToggleActive = async (userId) => {
    try {
      await API.put(`/users/${userId}/toggle-active`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users', formData);
      setIsModalOpen(false);
      fetchUsers();
      setFormData({
        username: '', email: '', password: '', role: 'STUDENT',
        firstName: '', lastName: '', rollNumber: '', className: '',
        semester: 1, employeeId: '', designation: '', departmentId: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const filteredUsers = users.filter(u =>
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            User Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Provision and manage student, faculty, and administrator accounts
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="gradient-btn">
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <select className="form-select" style={{ width: '180px' }} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}>
          <option value="">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="FACULTY">Faculty</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Role</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-surface)', color: 'var(--accent-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                      {u.firstName[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.firstName} {u.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'FACULTY' ? 'badge-warning' : 'badge-primary'}`}>
                    {u.role}
                  </span>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>
                    {u.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleActive(u.id)}
                    className={u.active ? 'btn-danger' : 'btn-secondary'}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                  >
                    {u.active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Account" maxWidth="650px">
        <form onSubmit={handleCreateUser}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Password</label>
              <input type="password" className="form-input" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            </div>
          </div>

          {/* Student Specific Fields */}
          {formData.role === 'STUDENT' && (
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input className="form-input" placeholder="e.g. CS-2024-025" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Class Name / Section</label>
                <input className="form-input" placeholder="e.g. CS-A" value={formData.className} onChange={(e) => setFormData({ ...formData, className: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Semester</label>
                <input type="number" className="form-input" min={1} max={8} value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} required>
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Faculty Specific Fields */}
          {formData.role === 'FACULTY' && (
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input className="form-input" placeholder="e.g. FAC-1006" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input className="form-input" placeholder="e.g. Assistant Professor" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} required />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Department</label>
                <select className="form-select" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} required>
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="gradient-btn">Create User Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
