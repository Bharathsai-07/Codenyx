import { useParams, useNavigate } from 'react-router-dom'
import { getTopicById } from '../data/subjects'
import { getQuizByTopicId } from '../data/quizzes'
import { markTopicCompleted, isTopicCompleted } from '../services/progressService'
import { useState, useEffect } from 'react'
import { useUiText } from '../translations'

export default function TopicLesson() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const [completed, setCompleted] = useState(false)
  const { t } = useUiText()

  const topic = getTopicById(topicId)
  const hasQuiz = !!getQuizByTopicId(topicId)

  useEffect(() => {
    setCompleted(isTopicCompleted(topicId))
  }, [topicId])

  if (!topic) {
    return (
      <div className="page animate-fade-in">
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>{t('topicNotFound')}</h2>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/lessons')}>
            {t('backToLessons')}
          </button>
        </div>
      </div>
    )
  }

  const handleMarkComplete = () => {
    markTopicCompleted(topicId)
    setCompleted(true)
  }

  // Simple markdown-like renderer
  const renderLesson = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h4 key={i} style={{ margin: '1.25rem 0 0.5rem', color: 'var(--accent)' }}>{line.replace('### ', '')}</h4>
      if (line.startsWith('## ')) return <h3 key={i} style={{ margin: '1.5rem 0 0.75rem', color: 'var(--secondary)' }}>{line.replace('## ', '')}</h3>
      if (line.startsWith('# ')) return <h2 key={i} style={{ margin: '1.5rem 0 0.75rem', fontSize: '1.5rem' }}>{line.replace('# ', '')}</h2>
      if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>{renderInline(line.replace('- ', ''))}</li>
      if (line.startsWith('| ')) return null // skip table rendering for simplicity
      if (line.trim() === '') return <br key={i} />
      return <p key={i} style={{ marginBottom: '0.5rem', color: 'var(--text-main)', lineHeight: '1.8' }}>{renderInline(line)}</p>
    })
  }

  const renderInline = (text) => {
    // Bold
    const parts = text.split(/\*\*(.*?)\*\*/)
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: '#fff' }}>{part}</strong> : part)
  }

  return (
    <div className="page animate-fade-in">
      <button className="btn btn-outline back-btn" onClick={() => navigate('/lessons')}>
        ← {t('backToLessons')}
      </button>

      <div className="lesson-header" style={{ margin: '1.5rem 0' }}>
        <div className="flex align-center" style={{ gap: '1rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{topic.subjectIcon} {topic.subjectName}</span>
          <span className="level-badge" style={{ background: 'var(--primary)', fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>{t('level')} {topic.level}</span>
        </div>
        <h1 style={{ fontSize: '1.75rem' }}>{topic.title}</h1>
        <p style={{ fontSize: '0.875rem' }}>⏱ {topic.duration} {t('readSuffix')}</p>
      </div>

      <div className="glass-card lesson-content">
        {renderLesson(topic.lesson)}
      </div>

      <div className="lesson-footer glass-card" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {completed ? (
            <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>✅ {t('completed')}</span>
          ) : (
            <button className="btn btn-primary" onClick={handleMarkComplete}>{t('markCompleted')}</button>
          )}
        </div>
        <div className="flex" style={{ gap: '1rem' }}>
          {hasQuiz && (
            <button className="btn btn-primary" onClick={() => navigate(`/quiz/${topicId}`)}>
              {t('takeQuiz')} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
