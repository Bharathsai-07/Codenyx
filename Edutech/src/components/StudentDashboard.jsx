import { useNavigate } from 'react-router-dom'
import { useRole } from '../hooks/useRole'
import { getProgressStats, getCompletedTopicIds } from '../services/progressService'
import { getAllTopics } from '../data/subjects'
import { ACHIEVEMENTS } from '../data/achievements'
import { getLocaleForLanguage, useUiText } from '../translations'
import VideoCallWidget from './VideoCallWidget'

export default function StudentDashboard() {
  const { userName, userImage, role } = useRole()
  const { t, language } = useUiText()
  const navigate = useNavigate()
  const stats = getProgressStats()
  const completedIds = getCompletedTopicIds()
  const allTopics = getAllTopics()
  const earnedBadges = ACHIEVEMENTS.filter(a => a.condition(stats))

  // Find next recommended topic (first uncompleted)
  const nextTopic = allTopics.find(t => !completedIds.includes(t.id))

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{t('studentWelcomeBack')}, {userName}! 👋</h1>
          <p>{new Date().toLocaleDateString(getLocaleForLanguage(language), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="user-profile">
          <div className="flex flex-col" style={{ alignItems: 'flex-end' }}>
            <span style={{ fontWeight: 600 }}>{userName}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{`${t('level')} ${stats.level} ${t('student')}`}</span>
          </div>
          <div className="avatar">
            <img src={userImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0s' }}>
          <div className="stat-label">{t('currentLevel')}</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>Lvl {stats.level}</div>
          <div className="progress-container" style={{ marginTop: '0.5rem' }}>
            <div className="progress-bar" style={{ width: `${(stats.totalPoints % 200) / 2}%` }}></div>
          </div>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-label">{t('averageScore')}</div>
          <div className="stat-value" style={{ color: stats.averageScore >= 60 ? 'var(--secondary)' : 'var(--accent)' }}>
            {stats.totalQuizzes > 0 ? `${stats.averageScore}%` : '—'}
          </div>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-label">{t('totalPoints')}</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.totalPoints}</div>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="stat-label">{t('topicsDone')}</div>
          <div className="stat-value" style={{ color: '#ec4899' }}>{completedIds.length}/{allTopics.length}</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        {/* Left column */}
        <div className="flex flex-col" style={{ gap: '1.5rem' }}>
          {/* Recommended Next */}
          {nextTopic && (
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, var(--primary), #4338ca)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>{t('recommendedNext')}</p>
                  <h3 style={{ fontSize: '1.1rem' }}>{nextTopic.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', margin: '0.25rem 0 1rem' }}>
                    {nextTopic.subjectIcon} {nextTopic.subjectName} • Level {nextTopic.level}
                  </p>
                </div>
                <span style={{ fontSize: '2rem' }}>🎯</span>
              </div>
              <button className="btn" style={{ background: '#fff', color: 'var(--primary)', padding: '0.5rem 1.25rem' }}
                onClick={() => navigate(`/learn/${nextTopic.id}`)}>
                {t('startLearning')} →
              </button>
            </div>
          )}

          {/* Recent Quiz Scores */}
          <div className="glass-card">
            <div className="flex justify-between align-center" style={{ marginBottom: '1rem' }}>
              <h3>📝 {t('recentScores')}</h3>
              <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                onClick={() => navigate('/progress')}>{t('viewAll')}</button>
            </div>
            {stats.recentResults.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0' }}>{t('noQuizzesYet')}</p>
            ) : (
              stats.recentResults.map(r => (
                <div key={r.id} className="flex justify-between align-center" style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--surface-border)' }}>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 500, fontSize: '0.9rem' }}>{r.topicTitle}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{new Date(r.date).toLocaleDateString()}</span>
                  </div>
                  <span className={`badge ${r.percentage >= 60 ? 'badge-success' : 'badge-warning'}`}>{r.percentage}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col" style={{ gap: '1.5rem' }}>
          {/* Progress Summary */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem' }}>📊 {t('progressSummary')}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{stats.totalQuizzes}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t('quizzes')}</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--secondary)' }}>{stats.streak}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t('streak')}</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{earnedBadges.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t('badges')}</div>
              </div>
            </div>
            {stats.weakTopics.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.1)', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                  ⚠️ {t('weakTopicsNeedAttention').replace('{count}', String(stats.weakTopics.length))}
                </p>
              </div>
            )}
            <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }} onClick={() => navigate('/progress')}>
              {t('fullReport')}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem' }}>⚡ {t('quickActions')}</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={() => navigate('/lessons')}>
                <span>📚</span>
                <span>{t('navLessons')}</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/chat')}>
                <span>💬</span>
                <span>{t('askDoubt')}</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/achievements')}>
                <span>🏆</span>
                <span>{t('badges')}</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/profile')}>
                <span>⚙️</span>
                <span>{t('navProfile')}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <VideoCallWidget userId={userName} userRole={role} userName={userName} />
    </div>
  )
}
