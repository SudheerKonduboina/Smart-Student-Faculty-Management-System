import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, BookOpen, Calendar,
  CheckSquare, QrCode, FileText, Award, UserCheck, BarChart3,
  Bell, User
} from 'lucide-react';

export const Sidebar = () => {
  const { role } = useAuth();

  const renderLinks = () => {
    switch (role) {
      case 'ADMIN':
        return (
          <>
            <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <SidebarLink to="/admin/users" icon={<Users size={18} />} label="Manage Users" />
            <SidebarLink to="/admin/departments" icon={<Building2 size={18} />} label="Departments" />
            <SidebarLink to="/admin/subjects" icon={<BookOpen size={18} />} label="Subjects" />
            <SidebarLink to="/admin/timetable" icon={<Calendar size={18} />} label="Timetable" />
            <SidebarLink to="/admin/analytics" icon={<BarChart3 size={18} />} label="Analytics" />
          </>
        );
      case 'FACULTY':
        return (
          <>
            <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <SidebarLink to="/faculty/attendance" icon={<CheckSquare size={18} />} label="Attendance" />
            <SidebarLink to="/faculty/qr-session" icon={<QrCode size={18} />} label="Live QR Class" />
            <SidebarLink to="/faculty/assignments" icon={<FileText size={18} />} label="Assignments" />
            <SidebarLink to="/faculty/leaves" icon={<UserCheck size={18} />} label="Leave Approvals" />
            <SidebarLink to="/faculty/grades" icon={<Award size={18} />} label="Grade Submissions" />
            <SidebarLink to="/faculty/timetable" icon={<Calendar size={18} />} label="My Schedule" />
          </>
        );
      case 'STUDENT':
        return (
          <>
            <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <SidebarLink to="/student/attendance" icon={<CheckSquare size={18} />} label="My Attendance" />
            <SidebarLink to="/student/qr-scan" icon={<QrCode size={18} />} label="Scan QR Code" />
            <SidebarLink to="/student/assignments" icon={<FileText size={18} />} label="My Assignments" />
            <SidebarLink to="/student/leaves" icon={<UserCheck size={18} />} label="Leave Requests" />
            <SidebarLink to="/student/grades" icon={<Award size={18} />} label="My Report Card" />
            <SidebarLink to="/student/timetable" icon={<Calendar size={18} />} label="My Class Schedule" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="glass-card" style={{ borderRadius: 0, width: '240px', minHeight: 'calc(100vh - 65px)', padding: '1.25rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', borderTop: 0, borderBottom: 0, borderLeft: 0 }}>
      <div style={{ padding: '0 0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
        Main Navigation
      </div>
      {renderLinks()}

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ padding: '0 0.5rem 0.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          Account
        </div>
        <SidebarLink to="/profile" icon={<User size={18} />} label="My Profile" />
        <SidebarLink to="/notifications" icon={<Bell size={18} />} label="Notifications" />
      </div>
    </aside>
  );
};

const SidebarLink = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.7rem 1rem',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.9rem',
        fontWeight: isActive ? 700 : 500,
        textDecoration: 'none',
        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
        background: isActive ? 'var(--accent-surface)' : 'transparent',
        transition: 'all 0.2s ease',
        borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent'
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};
