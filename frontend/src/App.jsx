import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';

// Admin
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminTimetable } from './pages/admin/AdminTimetable';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

// Faculty
import { FacultyAttendance } from './pages/faculty/FacultyAttendance';
import { FacultyQrSession } from './pages/faculty/FacultyQrSession';
import { FacultyAssignments } from './pages/faculty/FacultyAssignments';
import { FacultyLeaves } from './pages/faculty/FacultyLeaves';
import { FacultyGrades } from './pages/faculty/FacultyGrades';
import { FacultyTimetable } from './pages/faculty/FacultyTimetable';

// Student
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentQrScan } from './pages/student/StudentQrScan';
import { StudentAssignments } from './pages/student/StudentAssignments';
import { StudentLeaves } from './pages/student/StudentLeaves';
import { StudentGrades } from './pages/student/StudentGrades';
import { StudentTimetable } from './pages/student/StudentTimetable';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>Loading Application...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;

  return children;
};

const MainLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Main Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><AdminUsers /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><AdminDepartments /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><AdminSubjects /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/timetable" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><AdminTimetable /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout><AdminAnalytics /></MainLayout></ProtectedRoute>} />

          {/* Faculty Routes */}
          <Route path="/faculty/attendance" element={<ProtectedRoute allowedRoles={['FACULTY']}><MainLayout><FacultyAttendance /></MainLayout></ProtectedRoute>} />
          <Route path="/faculty/qr-session" element={<ProtectedRoute allowedRoles={['FACULTY']}><MainLayout><FacultyQrSession /></MainLayout></ProtectedRoute>} />
          <Route path="/faculty/assignments" element={<ProtectedRoute allowedRoles={['FACULTY']}><MainLayout><FacultyAssignments /></MainLayout></ProtectedRoute>} />
          <Route path="/faculty/leaves" element={<ProtectedRoute allowedRoles={['FACULTY']}><MainLayout><FacultyLeaves /></MainLayout></ProtectedRoute>} />
          <Route path="/faculty/grades" element={<ProtectedRoute allowedRoles={['FACULTY']}><MainLayout><FacultyGrades /></MainLayout></ProtectedRoute>} />
          <Route path="/faculty/timetable" element={<ProtectedRoute allowedRoles={['FACULTY']}><MainLayout><FacultyTimetable /></MainLayout></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['STUDENT']}><MainLayout><StudentAttendance /></MainLayout></ProtectedRoute>} />
          <Route path="/student/qr-scan" element={<ProtectedRoute allowedRoles={['STUDENT']}><MainLayout><StudentQrScan /></MainLayout></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['STUDENT']}><MainLayout><StudentAssignments /></MainLayout></ProtectedRoute>} />
          <Route path="/student/leaves" element={<ProtectedRoute allowedRoles={['STUDENT']}><MainLayout><StudentLeaves /></MainLayout></ProtectedRoute>} />
          <Route path="/student/grades" element={<ProtectedRoute allowedRoles={['STUDENT']}><MainLayout><StudentGrades /></MainLayout></ProtectedRoute>} />
          <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={['STUDENT']}><MainLayout><StudentTimetable /></MainLayout></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
