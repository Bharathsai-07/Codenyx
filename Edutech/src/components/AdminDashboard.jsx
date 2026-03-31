import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useRole } from '../hooks/useRole'
import { getLocaleForLanguage, useUiText } from '../translations'
import { getAdminUsers } from '../services/adminService'

const ADMIN_DATA = {
  stats: [
    { label: 'Total Users', value: '1,254', color: 'var(--primary)' },
    { label: 'Active Mentors', value: '48', color: 'var(--secondary)' },
    { label: 'Avg Performance', value: '76%', color: 'var(--accent)' },
    { label: 'Active Sessions', value: '312', color: '#ec4899' },
  ],
  systemHealth: [
    { area: 'Platform Stability', status: 'Operational', health: '99.9%',  },
    { area: 'User Growth (MTD)', status: '+15.3%', health: 'Excellent',  },
    { area: 'Content Coverage', status: '82%', health: 'Pending Updates', },
    { area: 'Server Response', status: '45ms avg', health: 'Optimal',  },
  ],
}

export default function AdminDashboard() {
  const { userName, userImage, role } = useRole()
  const { getToken } = useAuth()
  const { t, language } = useUiText()
  const [userTotals, setUserTotals] = useState({
    totalUsers: 0,
    activeMentors: 0,
    onlineUsers: 0,
  })

  useEffect(() => {
    let cancelled = false

    const loadClerkUsers = async () => {
      try {
        const token = await getToken({ skipCache: true })
        if (!token) {
          throw new Error('Unable to authenticate admin request. Please sign out and sign in again.')
        }

        const data = await getAdminUsers(token)
        if (cancelled) return

        setUserTotals({
          totalUsers: data?.totals?.totalUsers || 0,
          activeMentors: data?.totals?.activeMentors || 0,
          onlineUsers: data?.totals?.onlineUsers || 0,
        })
      } catch (error) {
        // Keep dashboard resilient even if user totals fail to load.
        console.error('[admin-dashboard] Failed to load user totals:', error)
      }
    }

    if (role === 'admin') {
      loadClerkUsers()
    }

    return () => {
      cancelled = true
    }
  }, [getToken, role])

  const localizedStats = [
    { ...ADMIN_DATA.stats[0], label: t('totalUsers'), value: String(userTotals.totalUsers) },
    { ...ADMIN_DATA.stats[1], label: t('activeMentors'), value: String(userTotals.activeMentors) },
    { ...ADMIN_DATA.stats[2], label: t('avgPerformance') },
    { ...ADMIN_DATA.stats[3], label: t('activeSessions'), value: String(userTotals.onlineUsers) },
  ]

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{t('adminConsole')}</h1>
          <p>{t('systemOverview')} • {new Date().toLocaleDateString(getLocaleForLanguage(language), { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="user-profile">
          <div className="flex flex-col" style={{ alignItems: 'flex-end' }}>
            <span style={{ fontWeight: 600 }}>{userName}</span>
            <span className="badge" style={{ marginTop: '0.25rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{t('adminBadge')}</span>
          </div>
          <div className="avatar">
            <img src={userImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {localizedStats.map((s, i) => (
          <div className="stat-card animate-fade-in" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
        {/* System Health */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem' }}>{t('systemHealthGrowth')}</h3>
          {ADMIN_DATA.systemHealth.map((a, i) => (
            <div key={i} className="flex align-center justify-between" style={{ padding: '1.25rem 0', borderBottom: i < ADMIN_DATA.systemHealth.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
              <div className="flex align-center" style={{ gap: '1rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{a.icon}</span>
                <div>
                  <h4 style={{ fontSize: '0.95rem' }}>{a.area}</h4>
                  <p style={{ fontSize: '0.8rem' }}>Status: {a.status}</p>
                </div>
              </div>
              <span className={`badge ${a.health === 'Excellent' || a.health === '99.9%' || a.health === 'Optimal' ? 'badge-success' : 'badge-warning'}`}>{a.health}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Note */}
      {/* <div className="glass-card" style={{ marginTop: '1.5rem', background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>🔑 {t('roleManagement')}</h4>
        <p style={{ fontSize: '0.875rem', lineHeight: '1.7' }}>
          User roles are managed exclusively through the <strong style={{ color: '#fff' }}>Clerk Dashboard</strong>. 
          To assign or change a user's role, navigate to <strong style={{ color: '#fff' }}>Users → Select User → Public Metadata</strong> and set: 
          <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', margin: '0 4px', color: 'var(--secondary)' }}>
            {`{"role": "admin"}`}
          </code> or 
          <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', margin: '0 4px', color: 'var(--accent)' }}>
            {`{"role": "mentor"}`}
          </code>
        </p>
      </div> */}
    </div>
  )
}
