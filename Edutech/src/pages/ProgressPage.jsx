import { getProgressStats } from '../services/progressService'
import { useUiText } from '../translations'

export default function ProgressPage() {
  const stats = getProgressStats()
  const { t } = useUiText()

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1>📈 {t('progressTrackingTitle')}</h1>
        <p>{t('progressTrackingSub')}</p>
      </div>

      {stats.totalQuizzes === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          {/* <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div> */}
          <h3>{t('noQuizData')}</h3>
          <p style={{ marginTop: '0.5rem' }}>{t('noQuizDataSub')}</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">{t('averageScore')}</div>
              <div className="stat-value" style={{ color: stats.averageScore >= 60 ? 'var(--secondary)' : 'var(--accent)' }}>{stats.averageScore}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{t('quizzesTaken')}</div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.totalQuizzes}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{t('totalPoints')}</div>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.totalPoints}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{t('currentLevel')}</div>
              <div className="stat-value" style={{ color: '#ec4899' }}>Lvl {stats.level}</div>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
            {/* Score Trend */}
            <div className="glass-card">
              {/* <h3 style={{ marginBottom: '1.5rem' }}>📉 {t('scoreTrend')}</h3> */}
              <div className="score-chart">
                {stats.improvementData.map((d, i) => (
                  <div key={i} className="chart-bar-wrap">
                    <div className="chart-bar" style={{
                      height: `${d.score}%`,
                      background: d.score >= 80 ? 'var(--secondary)' : d.score >= 60 ? 'var(--primary)' : 'var(--accent)',
                    }}>
                      <span className="chart-bar-label">{d.score}%</span>
                    </div>
                    <span className="chart-bar-name">{d.topic.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="glass-card">
              {/* <h3 style={{ marginBottom: '1.5rem' }}>📊 {t('subjectBreakdown')}</h3> */}
              {Object.entries(stats.subjectBreakdown).map(([name, data]) => (
                <div key={name} style={{ marginBottom: '1.25rem' }}>
                  <div className="flex justify-between" style={{ marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{name}</span>
                    <span style={{ fontSize: '0.8rem' }}>{data.average}% avg • {data.quizzes} quiz{data.quizzes > 1 ? 'zes' : ''}</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${data.average}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Weak Topics */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem' }}> {t('weakTopics')} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>(Below 40%)</span></h3>
              {stats.weakTopics.length === 0 ? (
                <p style={{ color: 'var(--secondary)' }}> {t('noWeakTopics')}</p>
              ) : (
                stats.weakTopics.map(t => (
                  <div key={t.topicId} className="flex justify-between align-center" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--surface-border)' }}>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 500 }}>{t.title}</p>
                      <span style={{ fontSize: '0.75rem' }}>{t.subjectName}</span>
                    </div>
                    <span className="badge badge-warning">{t.average}%</span>
                  </div>
                ))
              )}
            </div>

            {/* Strong Topics */}
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem' }}> {t('strongTopics')} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>(Above 80%)</span></h3>
              {stats.strongTopics.length === 0 ? (
                <p>{t('practiceAbove80')}</p>
              ) : (
                stats.strongTopics.map(t => (
                  <div key={t.topicId} className="flex justify-between align-center" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--surface-border)' }}>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 500 }}>{t.title}</p>
                      <span style={{ fontSize: '0.75rem' }}>{t.subjectName}</span>
                    </div>
                    <span className="badge badge-success">{t.average}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Results */}
          <div className="glass-card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}> {t('recentResults')}</h3>
            {stats.recentResults.map(r => (
              <div key={r.id} className="flex justify-between align-center" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--surface-border)' }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 500 }}>{r.topicTitle}</p>
                  <span style={{ fontSize: '0.75rem' }}>{r.subjectName} • {new Date(r.date).toLocaleDateString()}</span>
                </div>
                <div className="flex align-center" style={{ gap: '1rem' }}>
                  <span className={`badge ${r.percentage >= 60 ? 'badge-success' : 'badge-warning'}`}>{r.percentage}%</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{r.score}/{r.totalQuestions}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
