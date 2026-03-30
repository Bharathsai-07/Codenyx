import { useRole } from '../hooks/useRole'

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

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Admin Console</h1>
          <p>System overview • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="user-profile">
          <div className="flex flex-col" style={{ alignItems: 'flex-end' }}>
            <span style={{ fontWeight: 600 }}>{userName}</span>
            <span className="badge" style={{ marginTop: '0.25rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Admin</span>
          </div>
          <div className="avatar">
            <img src={userImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {ADMIN_DATA.stats.map((s, i) => (
          <div className="stat-card animate-fade-in" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {/* System Health */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem' }}>🖥️ System Health & Growth</h3>
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
          <h3 style={{ marginBottom: '1.5rem' }}>👤 Recently Joined Users</h3>
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
            <button className="btn btn-primary" style={{ flex: 1 }}>Manage Users</button>
            <button className="btn btn-outline" style={{ flex: 1 }}>View Logs</button>
          </div>
        </div>
      </div>

      {/* Admin Note */}
      <div className="glass-card" style={{ marginTop: '1.5rem', background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>🔑 Role Management</h4>
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
      </div>
    </div>
  )
}
