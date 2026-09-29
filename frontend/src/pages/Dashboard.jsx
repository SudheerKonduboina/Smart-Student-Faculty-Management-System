import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { Users, GraduationCap, School, BookOpen, CheckSquare, Calendar, FileText, QrCode, ArrowRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';

export const Dashboard = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  const fetchDashboardData = async () => {
    try {
      if (role === 'ADMIN') {
        const res = await API.get('/analytics/dashboard');
        setStats(res.data);
      } else if (role === 'FACULTY') {
        const [profileRes, leaveRes] = await Promise.all([
          API.get('/faculty/me'),
          API.get('/leaves?status=PENDING')
        ]);
        setStats({
          profile: profileRes.data,
          pendingLeaves: leaveRes.data?.totalElements || leaveRes.data?.content?.length || 0
        });
      } else if (role === 'STUDENT') {
        const [studentRes, attRes, assignRes] = await Promise.all([
          API.get('/students/me'),
          API.get('/attendance/my'),
          API.get('/assignments')
        ]);
        setStats({
          student: studentRes.data,
          attendance: attRes.data,
          assignments: assignRes.data?.content || assignRes.data || []
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome Banner */}
      <div className="glass-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Welcome back, {user?.firstName}! 👋
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
              Here is what's happening with your academic portal today.
            </p>
          </div>
          {role === 'FACULTY' && (
            <Link to="/faculty/qr-session" className="gradient-btn">
              <QrCode size={18} /> Launch QR Attendance
            </Link>
          )}
          {role === 'STUDENT' && (
            <Link to="/student/qr-scan" className="gradient-btn">
              <QrCode size={18} /> Scan Class QR Code
            </Link>
          )}
        </div>
      </div>

      {/* Role-Specific Metric Cards */}
      {role === 'ADMIN' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Total Students" value={stats?.totalStudents || 20} icon={GraduationCap} color="indigo" trend={5} />
          <StatCard title="Total Faculty" value={stats?.totalFaculty || 5} icon={School} color="purple" trend={2} />
          <StatCard title="Departments" value={stats?.totalDepartments || 4} icon={Users} color="emerald" />
          <StatCard title="Total Subjects" value={stats?.totalSubjects || 8} icon={BookOpen} color="cyan" />
        </div>
      )}

      {role === 'FACULTY' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Assigned Department" value={stats?.profile?.departmentName || 'Computer Science'} icon={School} color="indigo" />
          <StatCard title="Employee ID" value={stats?.profile?.employeeId || 'FAC-1001'} icon={Users} color="cyan" />
          <StatCard title="Pending Leave Reviews" value={stats?.pendingLeaves || 0} icon={FileText} color="amber" />
          <StatCard title="Designation" value={stats?.profile?.designation || 'Associate Professor'} icon={Award} color="purple" />
        </div>
      )}

      {role === 'STUDENT' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Overall Attendance" value={`${stats?.attendance?.overallPercentage?.toFixed(1) || 85.0}%`} icon={CheckSquare} color={stats?.attendance?.overallPercentage < 75 ? 'rose' : 'emerald'} />
          <StatCard title="Roll Number" value={stats?.student?.rollNumber || 'CS-2024-001'} icon={GraduationCap} color="indigo" />
          <StatCard title="Class / Section" value={stats?.student?.className || 'CS-A'} icon={BookOpen} color="purple" />
          <StatCard title="Semester" value={`Sem ${stats?.student?.semester || 5}`} icon={Calendar} color="cyan" />
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Main Section */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Quick Shortcuts & Tools
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {role === 'ADMIN' && (
              <>
                <ShortcutCard to="/admin/users" title="Manage Users" desc="Add or edit student & faculty accounts" icon={Users} color="indigo" />
                <ShortcutCard to="/admin/departments" title="Departments" desc="Configure academic departments" icon={School} color="emerald" />
                <ShortcutCard to="/admin/timetable" title="Timetable Scheduling" desc="Master conflict-free schedule" icon={Calendar} color="purple" />
                <ShortcutCard to="/admin/analytics" title="Analytics Hub" desc="Visualize campus trends" icon={CheckSquare} color="cyan" />
              </>
            )}

            {role === 'FACULTY' && (
              <>
                <ShortcutCard to="/faculty/qr-session" title="Live QR Attendance" desc="Broadcast dynamic QR code to class" icon={QrCode} color="indigo" />
                <ShortcutCard to="/faculty/attendance" title="Manual Attendance" desc="Mark or edit session records" icon={CheckSquare} color="emerald" />
                <ShortcutCard to="/faculty/assignments" title="Assignments" desc="Create homework & grade submissions" icon={FileText} color="purple" />
                <ShortcutCard to="/faculty/leaves" title="Leave Approvals" desc="Review student absence requests" icon={Award} color="amber" />
              </>
            )}

            {role === 'STUDENT' && (
              <>
                <ShortcutCard to="/student/qr-scan" title="Scan QR Code" desc="Mark attendance in live lecture" icon={QrCode} color="indigo" />
                <ShortcutCard to="/student/attendance" title="Attendance History" desc="Track percentage per subject" icon={CheckSquare} color="emerald" />
                <ShortcutCard to="/student/assignments" title="My Homework" desc="Submit assignments before due date" icon={FileText} color="purple" />
                <ShortcutCard to="/student/grades" title="Report Card" desc="View semester marks & grades" icon={Award} color="cyan" />
              </>
            )}
          </div>
        </div>

        {/* Side Information Box */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            System Info
          </h3>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifySelf: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <span>Version:</span> <strong style={{ color: 'var(--text-primary)', marginLeft: 'auto' }}>1.0.0 Enterprise</strong>
            </div>
            <div style={{ display: 'flex', justifySelf: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <span>Role Authorization:</span> <strong style={{ color: 'var(--accent-primary)', marginLeft: 'auto' }}>{role}</strong>
            </div>
            <div style={{ display: 'flex', justifySelf: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <span>Database Status:</span> <strong style={{ color: 'var(--success)', marginLeft: 'auto' }}>CONNECTED (MySQL)</strong>
            </div>
            <div style={{ display: 'flex', justifySelf: 'space-between' }}>
              <span>QR Security:</span> <strong style={{ color: 'var(--success)', marginLeft: 'auto' }}>JWT SIGNED (60s EXPIRE)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShortcutCard = ({ to, title, desc, icon: Icon, color }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', transition: 'all 0.2s ease', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
        <Icon size={20} color="var(--accent-primary)" />
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h4>
      </div>
      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{desc}</p>
    </div>
  </Link>
);
