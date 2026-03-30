import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTopicById } from '../data/subjects'
import { getQuizByTopicId } from '../data/quizzes'
import { saveQuizResult, markTopicCompleted } from '../services/progressService'
import { useUiText } from '../translations'

export default function QuizPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()

  const topic = getTopicById(topicId)
  const quiz = getQuizByTopicId(topicId)

  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const { t } = useUiText()

  if (!topic || !quiz) {
    return (
      <div className="page animate-fade-in">
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>{t('quizNotAvailable')}</h2>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/lessons')}>{t('backToLessons')}</button>
        </div>
      </div>
    )
  }

  const questions = quiz.questions
  const q = questions[currentQ]
  const totalQ = questions.length
  const progress = ((currentQ + 1) / totalQ) * 100

  const handleSelect = (optionIndex) => {
    if (submitted) return
    setAnswers({ ...answers, [q.id]: optionIndex })
  }

  const handleNext = () => {
    if (currentQ < totalQ - 1) setCurrentQ(currentQ + 1)
  }

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1)
  }

  const handleSubmit = () => {
    let score = 0
    const answerDetails = questions.map(question => {
      const selected = answers[question.id]
      const correct = selected === question.answer
      if (correct) score++
      return { questionId: question.id, selected, correct }
    })

    markTopicCompleted(topicId)

    const res = saveQuizResult({
      topicId,
      topicTitle: topic.title,
      subjectId: topic.subjectId,
      subjectName: topic.subjectName,
      score,
      totalQuestions: totalQ,
      answers: answerDetails,
    })

    setResult(res)
    setSubmitted(true)
  }

  const allAnswered = Object.keys(answers).length === totalQ

  // Results screen
  if (submitted && result) {
    const percentage = result.percentage
    const emoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : percentage >= 40 ? '📖' : '💪'

    return (
      <div className="page animate-fade-in">
        <div className="quiz-result-card glass-card">
          <div className="quiz-result-emoji">{emoji}</div>
          <h2>{t('quizComplete')}</h2>
          <p style={{ fontSize: '1rem', marginTop: '0.5rem' }}>{quiz.title}</p>

          <div className="quiz-score-circle" style={{ '--score-color': percentage >= 60 ? 'var(--secondary)' : 'var(--accent)' }}>
            <span className="quiz-score-value">{percentage}%</span>
            <span className="quiz-score-label">{result.score}/{totalQ} {t('correct')}</span>
          </div>

          <div className="quiz-reward">
            <span>🏅 {t('pointsEarned')}: <strong style={{ color: 'var(--accent)' }}>+{result.score * 10}{percentage === 100 ? ' +50 bonus' : percentage >= 80 ? ' +20 bonus' : percentage >= 60 ? ' +10 bonus' : ''}</strong></span>
          </div>

          {/* Answer review */}
          <div className="quiz-review">
            {questions.map((question, i) => {
              const selected = answers[question.id]
              const correct = selected === question.answer
              return (
                <div key={question.id} className={`review-item ${correct ? 'review-correct' : 'review-wrong'}`}>
                  <div className="flex align-center" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span>{correct ? '✅' : '❌'}</span>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Q{i + 1}: {question.question}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', paddingLeft: '1.5rem' }}>
                    <p>{t('yourAnswer')}: <span style={{ color: correct ? 'var(--secondary)' : '#ef4444' }}>{question.options[selected] || t('notAnswered')}</span></p>
                    {!correct && <p>{t('correctAnswer')}: <span style={{ color: 'var(--secondary)' }}>{question.options[question.answer]}</span></p>}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex" style={{ gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => navigate('/lessons')}>{t('backToLessons')}</button>
            <button className="btn btn-primary" onClick={() => navigate('/progress')}>{t('viewProgress')}</button>
            <button className="btn btn-outline" onClick={() => navigate('/achievements')}>{t('achievementsTitleShort')}</button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz taking screen
  return (
    <div className="page animate-fade-in">
      <div className="quiz-header">
        <button className="btn btn-outline back-btn" onClick={() => navigate(`/learn/${topicId}`)}>← {t('back')}</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.25rem' }}>{quiz.title}</h2>
          <p style={{ fontSize: '0.8rem' }}>{topic.subjectName} • {t('level')} {topic.level}</p>
        </div>
        <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
          {currentQ + 1} / {totalQ}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-container" style={{ marginBottom: '2rem' }}>
        <div className="progress-bar" style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}></div>
      </div>

      <div className="glass-card quiz-question-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {q.question}
        </h3>

        <div className="quiz-options">
          {q.options.map((option, i) => (
            <button
              key={i}
              className={`quiz-option ${answers[q.id] === i ? 'quiz-option-selected' : ''}`}
              onClick={() => handleSelect(i)}
            >
              <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
              <span>{option}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-nav">
        <button className="btn btn-outline" onClick={handlePrev} disabled={currentQ === 0}>← {t('previous')}</button>
        <div className="quiz-dots">
          {questions.map((_, i) => (
            <button
              key={i}
              className={`quiz-dot ${i === currentQ ? 'quiz-dot-active' : ''} ${answers[questions[i].id] !== undefined ? 'quiz-dot-answered' : ''}`}
              onClick={() => setCurrentQ(i)}
            />
          ))}
        </div>
        {currentQ < totalQ - 1 ? (
          <button className="btn btn-primary" onClick={handleNext}>{t('next')} →</button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!allAnswered}
            style={{ background: allAnswered ? 'var(--secondary)' : 'var(--surface-border)' }}>
            {t('submitQuiz')}
          </button>
        )}
      </div>
    </div>
  )
}
