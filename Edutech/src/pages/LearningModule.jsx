import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SUBJECTS } from '../data/subjects'
import { isTopicCompleted, getResultsByTopic } from '../services/progressService'
import { useUiText } from '../translations'

export default function LearningModule() {
  const [selectedSubject, setSelectedSubject] = useState(null)
  const navigate = useNavigate()
  const { t } = useUiText()

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1>📚 {t('learningModuleTitle')}</h1>
        <p>{t('learningModuleSub')}</p>
      </div>

      {!selectedSubject ? (
        <div className="subject-grid">
          {SUBJECTS.map(subject => (
            <div
              key={subject.id}
              className="subject-card glass-card"
              onClick={() => setSelectedSubject(subject)}
              style={{ cursor: 'pointer', borderLeft: `4px solid ${subject.color}` }}
            >
              <div className="subject-card-header">
                <span className="subject-icon">{subject.icon}</span>
                <h3>{subject.name}</h3>
              </div>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{subject.description}</p>
              <div className="subject-meta">
                <span>{subject.levels.length} {t('levels')}</span>
                <span>{subject.levels.reduce((sum, l) => sum + l.topics.length, 0)} {t('topics')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button className="btn btn-outline back-btn" onClick={() => setSelectedSubject(null)}>
            ← {t('backToSubjects')}
          </button>

          <div className="subject-detail-header" style={{ borderLeft: `4px solid ${selectedSubject.color}`, paddingLeft: '1.5rem', margin: '1.5rem 0' }}>
            <h2>{selectedSubject.icon} {selectedSubject.name}</h2>
            <p>{selectedSubject.description}</p>
          </div>

          {selectedSubject.levels.map(level => (
            <div key={level.level} className="level-section">
              <div className="level-header">
                <span className="level-badge" style={{ background: selectedSubject.color }}>{t('level')} {level.level}</span>
                <h3>{level.name}</h3>
              </div>
              <div className="topics-list">
                {level.topics.map(topic => {
                  const completed = isTopicCompleted(topic.id)
                  const quizResults = getResultsByTopic(topic.id)
                  const bestScore = quizResults.length > 0 ? Math.max(...quizResults.map(r => r.percentage)) : null

                  return (
                    <div key={topic.id} className={`topic-card glass-card ${completed ? 'topic-completed' : ''}`}>
                      <div className="topic-info">
                        <div className="flex align-center" style={{ gap: '0.75rem' }}>
                          <span className="topic-status-dot" style={{ background: completed ? 'var(--secondary)' : 'var(--surface-border)' }}></span>
                          <div>
                            <h4>{topic.title}</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{topic.duration}</span>
                          </div>
                        </div>
                        <div className="topic-actions">
                          {bestScore !== null && (
                            <span className={`badge ${bestScore >= 60 ? 'badge-success' : 'badge-warning'}`}>
                              {t('best')}: {bestScore}%
                            </span>
                          )}
                          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/learn/${topic.id}`)}>
                            {completed ? t('review') : t('start')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
