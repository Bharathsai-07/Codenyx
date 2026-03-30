import { useRole } from '../hooks/useRole'

const STUDENT_DATA = {
  stats: [
    { label: 'Courses Done', value: '12', color: 'var(--primary)' },
    { label: 'Avg Score', value: '88%', color: 'var(--secondary)' },
    { label: 'Hours Spent', value: '144h', color: 'var(--accent)' },
  ],
  progress: [
    { subject: 'Mathematics (Calculus)', current: 75, trend: '+4%', level: 'Needs Practice' },
    { subject: 'Quantum Physics', current: 40, trend: '+12%', level: 'Emerging' },
    { subject: 'Literature Analysis', current: 90, trend: '+1%', level: 'Mastered' },
  ],
  tasks: [
    { id: 1, title: 'Complete Algebra Assignment', deadline: 'Today', status: 'Pending' },
    { id: 2, title: 'Review Chapter 5: Thermodynamics', deadline: 'Tomorrow', status: 'Review' },
    { id: 3, title: 'Submit Physics Lab Report', deadline: 'Wed', status: 'Pending' },
  ],
}

export default function StudentDashboard() {
  const { userName, userImage } = useRole()

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Student Portal</h1>
          <p>Welcome back, {userName} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="user-profile">
          <div className="flex flex-col" style={{ alignItems: 'flex-end' }}>
            <span style={{ fontWeight: 600 }}>{userName}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Student</span>
          </div>
          <div className="avatar">
            <img src={userImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      <div className="stats-grid">
        {STUDENT_DATA.stats.map((s, i) => (
          <div className="stat-card animate-fade-in" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        {/* Performance Insights */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem' }}>📈 Performance Insights</h3>
          {STUDENT_DATA.progress.map((p, i) => (
            <div className="glass-card" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)' }} key={i}>
              <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.95rem' }}>{p.subject}</h4>
                <span className={`badge ${p.level === 'Mastered' ? 'badge-success' : 'badge-warning'}`}>{p.level}</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${p.current}%` }}></div>
              </div>
              <div className="flex justify-between" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Progress: {p.current}%</span>
                <span style={{ color: 'var(--secondary)' }}>{p.trend}</span>
              </div>
            </div>
          ))}
          <button className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }}>View Full Report</button>
        </div>

        {/* Tasks + Help */}
        <div className="flex flex-col" style={{ gap: '1.5rem' }}>
          <div className="glass-card" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1.5rem' }}>📋 Current Tasks</h3>
            {STUDENT_DATA.tasks.map(t => (
              <div key={t.id} className="flex align-center justify-between" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--surface-border)' }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 500 }}>{t.title}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Due {t.deadline}</span>
                </div>
                <span className={`badge ${t.status === 'Pending' ? 'badge-warning' : 'badge-success'}`}>{t.status}</span>
              </div>
            ))}
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>Submit Task</button>
          </div>

          <div className="glass-card" style={{ background: 'linear-gradient(135deg, var(--primary), #4338ca)', color: '#fff' }}>
            <h4>💬 Real-time Doubt Support</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', margin: '0.5rem 0 1rem' }}>
              Get instant support from mentors for any concept you're stuck on.
            </p>
            <button className="btn" style={{ background: '#fff', color: 'var(--primary)', padding: '0.5rem 1rem' }}>Ask a Question</button>
          </div>
        </div>
      </div>
    </div>
  )
}
