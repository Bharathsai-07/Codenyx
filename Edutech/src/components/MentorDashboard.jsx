import { useRole } from '../hooks/useRole'
import { getLocaleForLanguage, useUiText } from '../translations'
import AIChatWidget from './AIChatWidget'
import VideoCallWidget from './VideoCallWidget'

const MENTOR_DATA = {
  stats: [
    { label: 'Students', value: '45', color: 'var(--primary)' },
    { label: 'Total Hours', value: '1,200', color: 'var(--secondary)' },
    { label: 'Rating', value: '4.9 ★', color: 'var(--accent)' },
  ],
  studentWatchlist: [
    { name: 'Alex Johnson', progress: 68, status: 'At Risk', weakArea: 'Calculus' },
    { name: 'Jamie Doe', progress: 92, status: 'Excellent', weakArea: 'None' },
    { name: 'Sam Smith', progress: 45, status: 'Needs Support', weakArea: 'Mechanics' },
    { name: 'Priya Patel', progress: 78, status: 'On Track', weakArea: 'Optics' },
  ],
  recentDoubts: [
    { id: 101, student: 'Alex Johnson', question: 'Doubt in Integration by parts', time: '5m ago' },
    { id: 102, student: 'Mary Lane', question: 'Explain Black Hole Horizon', time: '12m ago' },
    { id: 103, student: 'Sam Smith', question: 'Newton\'s 3rd law real-world example', time: '30m ago' },
  ],
}

export default function MentorDashboard() {
  const { userName, userImage, role } = useRole()
  const { t, language } = useUiText()

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{t('mentorPortal')}</h1>
          <p>{t('studentWelcomeBack')}, {userName} • {new Date().toLocaleDateString(getLocaleForLanguage(language), { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="user-profile">
          <div className="flex flex-col" style={{ alignItems: 'flex-end' }}>
            <span style={{ fontWeight: 600 }}>{userName}</span>
            <span className="badge badge-success" style={{ marginTop: '0.25rem' }}>{t('mentorBadge')}</span>
          </div>
          <div className="avatar">
            <img src={userImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      <div className="stats-grid">
        {MENTOR_DATA.stats.map((s, i) => (
          <div className="stat-card animate-fade-in" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Student Watchlist Table */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>{t('studentWatchlist')}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-main)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>{t('student')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('progress')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('status')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('weakArea')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {MENTOR_DATA.studentWatchlist.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '100px', height: '6px', background: 'var(--surface-border)', borderRadius: '3px' }}>
                        <div style={{ width: `${s.progress}%`, height: '100%', background: s.progress > 70 ? 'var(--secondary)' : 'var(--accent)', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{s.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${s.status === 'Excellent' || s.status === 'On Track' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{s.weakArea}</td>
                  <td style={{ padding: '1rem' }}>
                    <button className="btn" style={{ padding: '0.35rem 1rem', fontSize: '0.8rem', color: 'var(--text-main)', background: 'rgba(37, 99, 235, 0.12)', border: '1px solid rgba(37, 99, 235, 0.25)', borderRadius: '6px' }}>
                      {t('review')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Doubts */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}> {t('pendingDoubts')}</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {MENTOR_DATA.recentDoubts.map(d => (
            <div key={d.id} className="glass-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{d.student}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{d.time}</span>
              </div>
              <p style={{ color: 'var(--text-main)', fontStyle: 'italic', fontSize: '0.9rem' }}>"{d.question}"</p>
              <button className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', marginTop: '1rem', fontSize: '0.85rem' }}>{t('answerNow')}</button>
            </div>
          ))}
        </div>
      </div>

      <AIChatWidget role="mentor" />
      <VideoCallWidget userId={userName} userRole={role} userName={userName} />
    </div>
  )
}
