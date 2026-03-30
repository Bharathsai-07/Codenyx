import { useMemo, useState } from 'react'
import { getAiChatReply } from '../services/aiChatService'
import { useUiText } from '../translations'

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function AIChatWidget({ role = 'student' }) {
  const { t, language } = useUiText()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const initialMessage = useMemo(() => {
    if (role === 'mentor') {
      return {
        id: makeId(),
        role: 'assistant',
        text: t('aiMentorGreeting'),
      }
    }

    return {
      id: makeId(),
      role: 'assistant',
      text: t('aiStudentGreeting'),
    }
  }, [role, t])

  const [messages, setMessages] = useState([initialMessage])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage = { id: makeId(), role: 'user', text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const aiText = await getAiChatReply({
        role,
        language,
        messages: updatedMessages.map((m) => ({ role: m.role, content: m.text })),
      })

      setMessages((prev) => [...prev, { id: makeId(), role: 'assistant', text: aiText }])
    } catch (err) {
      setError(err.message || t('aiError'))
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ai-widget-root">
      {isOpen && (
        <div className="ai-widget-panel glass-card animate-fade-in">
          <div className="ai-widget-header">
            <h4>{t('aiAssistantTitle')}</h4>
            <button className="modal-close" onClick={() => setIsOpen(false)}>x</button>
          </div>

          <div className="ai-widget-messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`ai-widget-bubble ${m.role === 'user' ? 'ai-widget-user' : 'ai-widget-assistant'}`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="ai-widget-status">{t('aiThinking')}</div>}
            {error && <div className="ai-widget-error">{error}</div>}
          </div>

          <div className="ai-widget-input-row">
            <textarea
              rows="2"
              className="chat-input-field ai-widget-input"
              placeholder={t('aiInputPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
              {t('send')}
            </button>
          </div>
        </div>
      )}

      <button className="ai-widget-toggle btn btn-primary" onClick={() => setIsOpen((v) => !v)}>
        {isOpen ? t('aiClose') : t('aiOpen')}
      </button>
    </div>
  )
}
