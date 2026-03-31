import { useClerk } from '@clerk/clerk-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRole } from '../hooks/useRole'
import { useUiText } from '../translations'

export default function Sidebar({ onMentorshipClick }) {
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const location = useLocation()
  const { role, userName, userImage } = useRole()
  const { t } = useUiText()

  const studentNav = [
    { id: 'dashboard', path: '/dashboard', label: t('navDashboard'), icon: '' },
    { id: 'lessons', path: '/lessons', label: t('navLessons'), icon: '' },
    { id: 'progress', path: '/progress', label: t('navProgress'), icon: '' },
    { id: 'chat', path: '/chat', label: t('navDoubts'), icon: '' },
    { id: 'achievements', path: '/achievements', label: t('navAchievements'), icon: '' },
    { id: 'profile', path: '/profile', label: t('navProfile'), icon: '' },
  ]

  const mentorshipSection = role === 'student' ? [
    { id: 'mentorship', path: '/dashboard', label: 'Apply for Mentorship', icon: '👨‍🏫', isMentorship: true }
  ] : []

  const mentorNav = [
    { id: 'dashboard', path: '/dashboard', label: t('navDashboard'), icon: '' },
    { id: 'students', path: '/students', label: t('navMyStudents'), icon: '' },
    { id: 'analytics', path: '/analytics', label: t('navAnalytics'), icon: '' },
    { id: 'support', path: '/support', label: t('navSupport'), icon: '' },
    { id: 'profile', path: '/profile', label: t('navProfile'), icon: '' },
  ]

  const adminNav = [
    { id: 'dashboard', path: '/dashboard', label: t('navDashboard'), icon: '' },
    { id: 'users', path: '/users', label: t('navUsers'), icon: '' },
    { id: 'mentor-requests', path: '/mentor-requests', label: t('navMentorRequests'), icon: '' },
    { id: 'analytics', path: '/analytics', label: t('navAnalytics'), icon: '' },
    { id: 'profile', path: '/profile', label: t('navProfile'), icon: '' },
  ]

  const navItems = role === 'admin' ? adminNav : role === 'mentor' ? mentorNav : studentNav

  const roleColors = {
    student: 'var(--primary)',
    mentor: 'var(--secondary)',
    admin: '#ef4444',
  }

  return (
    <aside className="sidebar">
      <div className="logo-area" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
        {/* <div className="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#sideGrad)" />
            <path d="M9 16L14 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="sideGrad" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#10b981"/>
              </linearGradient>
            </defs>
          </svg>
        </div> */}
        <h2 className="logo-text" style={{ fontSize: '1.25rem', margin: 0 }}>{t('appName')}</h2>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </button>
        ))}
        
        {mentorshipSection.length > 0 && (
          <>
            <div style={{ borderTop: '1px solid var(--surface-border)', margin: '1rem 0' }}></div>
            {mentorshipSection.map(item => (
              <button
                key={item.id}
                className="nav-link"
                onClick={onMentorshipClick}
                style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                <span>{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.25rem' }}>
        <div className="flex align-center" style={{ gap: '0.75rem', padding: '0 0.5rem', marginBottom: '1rem' }}>
          <div className="avatar" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
            <img src={userImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="nav-text" style={{ overflow: 'hidden' }}>
            <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</p>
            <span style={{ fontSize: '0.7rem', color: roleColors[role], textTransform: 'capitalize' }}>{role}</span>
          </div>
        </div>
        <button
          className="nav-link"
          onClick={() => signOut(() => navigate('/login'))}
          style={{ color: '#ef4444' }}
        >
          <span>🚪</span>
          <span className="nav-text">{t('signOut')}</span>
        </button>
      </div>
    </aside>
  )
}
