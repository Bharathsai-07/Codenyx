import { useEffect, useState } from 'react'
import { useRole } from '../hooks/useRole'
import { getLocaleForLanguage, useUiText } from '../translations'
import { getMentorRequests, updateMentorRequest } from '../services/mentorRequestService'

const ADMIN_DATA = {
  stats: [
    { label: 'Total Users', value: '1,254', color: 'var(--primary)' },
    { label: 'Active Mentors', value: '48', color: 'var(--secondary)' },
    { label: 'Avg Performance', value: '76%', color: 'var(--accent)' },
    { label: 'Active Sessions', value: '312', color: '#ec4899' },
  ],
  systemHealth: [
    { area: 'Platform Stability', status: 'Operational', health: '99.9%', icon: '🟢' },
    { area: 'User Growth (MTD)', status: '+15.3%', health: 'Excellent', icon: '📈' },
    { area: 'Content Coverage', status: '82%', health: 'Pending Updates', icon: '📚' },
    { area: 'Server Response', status: '45ms avg', health: 'Optimal', icon: '⚡' },
  ],
  recentUsers: [
    { name: 'Alex Johnson', email: 'alex@email.com', role: 'student', joined: '2 hours ago' },
    { name: 'Dr. Sarah Lee', email: 'sarah@email.com', role: 'mentor', joined: '1 day ago' },
    { name: 'Jamie Doe', email: 'jamie@email.com', role: 'student', joined: '3 days ago' },
  ],
}

export default function AdminDashboard() {
  const { userName, userImage } = useRole()
  const { t, language } = useUiText()
  const [mentorRequests, setMentorRequests] = useState([])

  useEffect(() => {
    setMentorRequests(getMentorRequests())
  }, [])

  const refreshMentorRequests = () => {
    setMentorRequests(getMentorRequests())
  }

  const handleRejectRequest = (id) => {
    const note = window.prompt('Optional rejection reason for mentor request:') || 'Rejected by admin'
    updateMentorRequest(id, { status: 'rejected', adminNote: note })
    refreshMentorRequests()
  }

  const handleScheduleMeet = (id) => {
    const meetingTime = window.prompt('Enter meeting date/time (e.g., 2026-04-02 5:30 PM):')
    if (!meetingTime) return

    const meetingLink = window.prompt('Enter meeting link (Google Meet/Zoom URL):') || ''
    updateMentorRequest(id, {
      status: 'meeting_scheduled',
      meetingTime,
      meetingLink,
      adminNote: 'Meeting scheduled by admin',
    })
    refreshMentorRequests()
  }

  const statusBadgeClass = (status) => {
    if (status === 'meeting_scheduled') return 'badge-success'
    if (status === 'rejected') return 'badge-warning'
    return ''
  }

  const statusLabel = (status) => {
    if (status === 'meeting_scheduled') return 'Meeting Scheduled'
    if (status === 'rejected') return 'Rejected'
    return 'Pending Review'
  }

  const localizedStats = [
    { ...ADMIN_DATA.stats[0], label: t('totalUsers') },
    { ...ADMIN_DATA.stats[1], label: t('activeMentors') },
    { ...ADMIN_DATA.stats[2], label: t('avgPerformance') },
    { ...ADMIN_DATA.stats[3], label: t('activeSessions') },
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

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {/* System Health */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem' }}>🖥️ {t('systemHealthGrowth')}</h3>
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

        {/* Recent Users */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem' }}>👤 {t('recentUsers')}</h3>
          {ADMIN_DATA.recentUsers.map((u, i) => (
            <div key={i} className="flex align-center justify-between" style={{ padding: '1rem 0', borderBottom: i < ADMIN_DATA.recentUsers.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
              <div className="flex align-center" style={{ gap: '1rem' }}>
                <div className="avatar">
                  <img src={`https://ui-avatars.com/api/?name=${u.name}&background=6366f1&color=fff&size=40`} alt="" style={{ width: '100%', height: '100%' }} />
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: 500, fontSize: '0.95rem' }}>{u.name}</p>
                  <p style={{ fontSize: '0.75rem' }}>{u.email}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${u.role === 'mentor' ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span>
                <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>{u.joined}</p>
              </div>
            </div>
          ))}
          <div className="flex" style={{ gap: '1rem', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" style={{ flex: 1 }}>{t('manageUsers')}</button>
            <button className="btn btn-outline" style={{ flex: 1 }}>{t('viewLogs')}</button>
          </div>
        </div>
      </div>

      {/* Mentor Requests */}
      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>🧾 Mentor Requests</h3>
        {mentorRequests.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No mentor requests yet.</p>
        ) : (
          mentorRequests.map((req) => (
            <div
              key={req.id}
              style={{
                borderBottom: '1px solid var(--surface-border)',
                padding: '1rem 0',
              }}
            >
              <div className="flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600 }}>{req.name}</p>
                  <p style={{ fontSize: '0.8rem' }}>{req.email}</p>
                </div>
                <span className={`badge ${statusBadgeClass(req.status)}`}>{statusLabel(req.status)}</span>
              </div>

              <p style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <strong style={{ color: '#fff' }}>Subject:</strong> {req.subject} | <strong style={{ color: '#fff' }}>Experience:</strong> {req.experience} years
              </p>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <strong style={{ color: '#fff' }}>Reason:</strong> {req.reason}
              </p>
              <p style={{ fontSize: '0.75rem', marginBottom: '0.6rem' }}>
                Applied on {new Date(req.createdAt).toLocaleString(getLocaleForLanguage(language))}
              </p>

              {req.status === 'meeting_scheduled' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.8rem' }}><strong style={{ color: '#fff' }}>Meeting:</strong> {req.meetingTime || 'Not set'}</p>
                  {req.meetingLink && (
                    <a href={req.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                      Open Meeting Link
                    </a>
                  )}
                </div>
              )}

              {req.status === 'pending' && (
                <div className="flex" style={{ gap: '0.75rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleScheduleMeet(req.id)}>
                    Schedule Meet
                  </button>
                  <button className="btn btn-outline btn-sm" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' }} onClick={() => handleRejectRequest(req.id)}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
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
