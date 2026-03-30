import { ACHIEVEMENTS } from '../data/achievements'
import { getProgressStats } from '../services/progressService'
import { useUiText } from '../translations'

export default function AchievementsPage() {
  const stats = getProgressStats()
  const { t } = useUiText()

  const earned = ACHIEVEMENTS.filter(a => a.condition(stats))
  const locked = ACHIEVEMENTS.filter(a => !a.condition(stats))

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1>{t('achievementsTitle')}</h1>
        <p>{t('achievementsSub')}</p>
      </div>

      {/* Points & Level summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-label">{t('level')}</div>
          <div className="stat-value" style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>{stats.level}</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-label">{t('totalPoints')}</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.totalPoints}</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-label">{t('badgesEarned')}</div>
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>{earned.length}/{ACHIEVEMENTS.length}</div>
        </div>
        {/* <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-label">Current Streak</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{stats.streak} 🔥</div>
        </div> */}
      </div>

      {/* Level progress to next */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem' }}>
          <h3>{t('levelProgress')}</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{stats.totalPoints % 200}/200 {t('ptsToLevel')} {stats.level + 1}</span>
        </div>
        <div className="progress-container" style={{ height: '12px' }}>
          <div className="progress-bar" style={{ width: `${(stats.totalPoints % 200) / 2}%` }}></div>
        </div>
      </div>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{t('earnedBadges')} ({earned.length})</h3>
          <div className="achievements-grid">
            {earned.map(a => (
              <div key={a.id} className="achievement-card glass-card achievement-earned">
                <div className="achievement-icon" style={{ background: `${a.color}20`, borderColor: a.color }}>{a.icon}</div>
                <h4>{a.title}</h4>
                <p>{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-dim)' }}>{t('lockedBadges')} ({locked.length})</h3>
          <div className="achievements-grid">
            {locked.map(a => (
              <div key={a.id} className="achievement-card glass-card achievement-locked">
                <div className="achievement-icon achievement-icon-locked">{a.icon}</div>
                <h4>{a.title}</h4>
                <p>{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
