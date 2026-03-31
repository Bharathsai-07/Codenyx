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
import LearningModule from './pages/LearningModule'
import TopicLesson from './pages/TopicLesson'
import QuizPage from './pages/QuizPage'
import ProgressPage from './pages/ProgressPage'
import ChatPage from './pages/ChatPage'
import AchievementsPage from './pages/AchievementsPage'
import ProfileSettings from './pages/ProfileSettings'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminAnalyticsPage from './pages/AdminAnalyticsPage'
import AdminProfilePage from './pages/AdminProfilePage'
import AdminMentorRequestsPage from './pages/AdminMentorRequestsPage'
import MentorshipApplicationModal from './components/MentorshipApplicationModal'
import { useUiText } from './translations'
import { createContext, useContext, useState } from 'react'

const MentorshipContext = createContext()

export const useMentorshipModal = () => useContext(MentorshipContext)

function DashboardRouter() {
  const { role } = useRole()
  if (role === 'admin') return <AdminDashboard />
  if (role === 'mentor') return <MentorDashboard />
  return <StudentDashboard />
}

function AnalyticsRouter() {
  const { role } = useRole()
  const { t } = useUiText()

  if (role === 'admin') return <AdminAnalyticsPage />
  return <ComingSoon title={t('navAnalytics')} />
}

function ProfileRouter() {
  const { role } = useRole()

  if (role === 'admin') return <AdminProfilePage />
  return <ProfileSettings />
}

function AppLayout({ children }) {
  const { t } = useUiText()
  const [showMentorModal, setShowMentorModal] = useState(false)

  return (
    <MentorshipContext.Provider value={{ showMentorModal, setShowMentorModal }}>
      <div className="platform-container">
        <Sidebar onMentorshipClick={() => setShowMentorModal(true)} />
        <main className="main-content">
          {children}
          <footer className="app-footer flex justify-between">
          <p>&copy; {t('footerTagline')}</p>
          <div className="flex" style={{ gap: '1.5rem' }}>
            <a href="#">{t('footerSupport')}</a>
            <a href="#">{t('footerTerms')}</a>
            <a href="#">{t('footerPrivacy')}</a>
          </div>
        </footer>
      </main>
    </div>
      <MentorshipApplicationModal
        isOpen={showMentorModal}
        onClose={() => setShowMentorModal(false)}
      />
    </MentorshipContext.Provider>
  )
}

function ComingSoon({ title }) {
  const { t } = useUiText()

  return (
    <div className="page animate-fade-in">
      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
        <h2>{title}</h2>
        <p style={{ marginTop: '0.75rem', maxWidth: '400px', margin: '0.75rem auto 0' }}>
          {t('comingSoonDesc')}
        </p>
      </div>
    </div>
  )
}

function App() {
  const { isLoaded } = useAuth()
  const { t } = useUiText()

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>{t('loadingSmartLearn')}</p>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Dashboard — role auto-detected */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><DashboardRouter /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Student: Learning Module */}
      <Route path="/lessons" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><LearningModule /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Student: Topic Lesson */}
      <Route path="/learn/:topicId" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><TopicLesson /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Student: Quiz */}
      <Route path="/quiz/:topicId" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><QuizPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Student: Progress Tracking */}
      <Route path="/progress" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><ProgressPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Student: Doubt Chat */}
      <Route path="/chat" element={
        <ProtectedRoute allowedRoles={['student', 'mentor']}>
          <AppLayout><ChatPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Student: Achievements */}
      <Route path="/achievements" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><AchievementsPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Profile Settings — all roles */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><ProfileRouter /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Mentor only */}
      <Route path="/students" element={
        <ProtectedRoute allowedRoles={['mentor']}>
          <AppLayout><ComingSoon title={t('navMyStudents')} /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/support" element={
        <ProtectedRoute allowedRoles={['mentor']}>
          <AppLayout><ChatPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Mentor + Admin */}
      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={['mentor', 'admin']}>
          <AppLayout><AnalyticsRouter /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Admin only */}
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminUsersPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/mentor-requests" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminMentorRequestsPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
