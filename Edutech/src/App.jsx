import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useRole } from './hooks/useRole'
import LoginPage from './components/LoginPage'
import AccessDenied from './components/AccessDenied'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import StudentDashboard from './components/StudentDashboard'
import MentorDashboard from './components/MentorDashboard'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function DashboardRouter() {
  const { role } = useRole()

  if (role === 'admin') return <AdminDashboard />
  if (role === 'mentor') return <MentorDashboard />
  return <StudentDashboard />
}

function AppLayout({ children }) {
  return (
    <div className="platform-container">
      <Sidebar />
      <main className="main-content">
        {children}
        <footer className="app-footer flex justify-between">
          <p>&copy; 2026 SmartLearn. Personalized Education Platform.</p>
          <div className="flex" style={{ gap: '1.5rem' }}>
            <a href="#">Support</a>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </div>
        </footer>
      </main>
    </div>
  )
}

function ComingSoon({ title }) {
  return (
    <div className="dashboard-page animate-fade-in">
      <div className="coming-soon-card glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
        <h2>{title}</h2>
        <p style={{ marginTop: '0.75rem', maxWidth: '400px', margin: '0.75rem auto 0' }}>
          This section is under development and will be available soon.
        </p>
      </div>
    </div>
  )
}

function App() {
  const { isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>Loading SmartLearn...</p>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Protected: Any authenticated user */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><DashboardRouter /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/lessons" element={
        <ProtectedRoute>
          <AppLayout><ComingSoon title="Lessons" /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/support" element={
        <ProtectedRoute allowedRoles={['student', 'mentor']}>
          <AppLayout><ComingSoon title="Support Chat" /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Student only */}
      <Route path="/practice" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><ComingSoon title="Practice Tests" /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Mentor only */}
      <Route path="/students" element={
        <ProtectedRoute allowedRoles={['mentor']}>
          <AppLayout><ComingSoon title="My Students" /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Mentor + Admin */}
      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={['mentor', 'admin']}>
          <AppLayout><ComingSoon title="Analytics" /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Admin only */}
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><ComingSoon title="User Management" /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><ComingSoon title="Platform Settings" /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
