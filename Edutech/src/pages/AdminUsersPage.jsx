import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { getLocaleForLanguage, useUiText } from '../translations'
import { getAdminUsers } from '../services/adminService'

export default function AdminUsersPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const { t, language } = useUiText()

  const [clerkUsers, setClerkUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [userTotals, setUserTotals] = useState({
    totalUsers: 0,
    activeMentors: 0,
    onlineUsers: 0,
  })

  useEffect(() => {
    let cancelled = false

    const loadUsers = async () => {
      setUsersLoading(true)
      setUsersError('')

      try {
        const token = await getToken({ skipCache: true })
        if (!token) {
          throw new Error('Unable to authenticate admin request. Please sign out and sign in again.')
        }

        const data = await getAdminUsers(token)
        if (cancelled) return

        setClerkUsers(Array.isArray(data.users) ? data.users : [])
        setUserTotals({
          totalUsers: data?.totals?.totalUsers || 0,
          activeMentors: data?.totals?.activeMentors || 0,
          onlineUsers: data?.totals?.onlineUsers || 0,
        })
      } catch (error) {
        if (!cancelled) {
          setUsersError(error.message || 'Failed to fetch users')
        }
      } finally {
        if (!cancelled) {
          setUsersLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      cancelled = true
    }
  }, [getToken])

  const formatJoinedDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleDateString(getLocaleForLanguage(language), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getRoleClass = (role) => {
    if (role === 'admin') return 'admin-users-role admin-users-role-admin'
    if (role === 'mentor') return 'admin-users-role admin-users-role-mentor'
    return 'admin-users-role admin-users-role-student'
  }

  const visibleUsers = clerkUsers.filter((u) => u.id !== user?.id)

  return (
    <div className="page animate-fade-in admin-users-page">
      <header className="header admin-users-header glass-card">
        <div>
          <p className="admin-users-kicker">Admin Directory</p>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>{t('manageUsers')}</h1>
          <p style={{ color: 'var(--text-main)', maxWidth: '580px' }}>
            View and monitor users synced from Clerk with clearer role and activity indicators.
          </p>
          <div className="admin-users-legend">
            <span className="admin-users-pill admin-users-pill-blue">All Users</span>
            <span className="admin-users-pill admin-users-pill-green">Mentors</span>
            <span className="admin-users-pill admin-users-pill-amber">Active Sessions</span>
          </div>
        </div>
        <button className="btn btn-primary admin-users-refresh" onClick={() => window.location.reload()}>
          Refresh Users
        </button>
      </header>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat-card admin-users-stat admin-users-stat-primary">
          {/* <p className="admin-users-stat-icon"></p> */}
          <div className="stat-label">{t('totalUsers')}</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{userTotals.totalUsers}</div>
        </div>
        <div className="stat-card admin-users-stat admin-users-stat-success">
          {/* <p className="admin-users-stat-icon">🧑‍🏫</p> */}
          <div className="stat-label">{t('activeMentors')}</div>
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>{userTotals.activeMentors}</div>
        </div>
        <div className="stat-card admin-users-stat admin-users-stat-accent">
          {/* <p className="admin-users-stat-icon">⚡</p> */}
          <div className="stat-label">{t('activeSessions')}</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{userTotals.onlineUsers}</div>
        </div>
      </div>

      <div className="glass-card admin-users-list-card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.25rem' }}> {t('recentUsers')}</h3>
        <p style={{ marginBottom: '1.1rem', color: 'var(--text-main)' }}>Sorted by the latest synced data.</p>

        {usersLoading && <p className="admin-users-info">Loading users from Clerk...</p>}
        {!usersLoading && usersError && <p className="admin-users-error">{usersError}</p>}
        {!usersLoading && !usersError && visibleUsers.length === 0 && (
          <p className="admin-users-info">No users found in Clerk.</p>
        )}

        {!usersLoading && !usersError && visibleUsers.map((u, i) => (
          <div
            key={u.id}
            className="flex align-center justify-between admin-users-row"
            style={{
              padding: '1rem 0',
              borderBottom: i < visibleUsers.length - 1 ? '1px solid var(--surface-border)' : 'none',
            }}
          >
            <div className="flex align-center" style={{ gap: '1rem' }}>
              <div className="avatar">
                <img
                  src={u.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff&size=40`}
                  alt=""
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <div>
                <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem' }}>{u.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{u.email || 'No email'}</p>
              </div>
            </div>

            <div className="admin-users-meta" style={{ textAlign: 'right' }}>
              <span className={getRoleClass(u.role)}>
                {u.role}
              </span>
              <p className="admin-users-activity" style={{ fontSize: '0.73rem', marginTop: '0.3rem' }}>
                {u.isOnline ? '● Online now' : `Joined ${formatJoinedDate(u.createdAt)}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
